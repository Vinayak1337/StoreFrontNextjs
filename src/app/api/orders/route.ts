import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

// Define the expected item structure for order creation
interface OrderItemInput {
	itemId: string;
	quantity: number;
	price: number;
}

// GET /api/orders - Get all orders
export async function GET() {
	try {
		const orders = await prisma.order.findMany({
			include: {
				orderItems: {
					include: {
						item: true
					},
					orderBy: {
						id: 'desc' // Sort by ID descending as proxy for creation date
					}
				},
				bill: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		return NextResponse.json(orders);
	} catch (error) {
		console.error('Error fetching orders:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch orders' },
			{ status: 500 }
		);
	}
}

// POST /api/orders - Create a new order
export async function POST(req: NextRequest) {
	try {
		const data = await req.json();
		console.log('Received order data:', JSON.stringify(data, null, 2));

		// Validate required fields
		if (
			!data.customerName ||
			!Array.isArray(data.items) ||
			data.items.length === 0
		) {
			console.error('Validation failed:', {
				customerName: !!data.customerName,
				items: Array.isArray(data.items),
				itemsLength: data.items?.length || 0
			});
			return NextResponse.json(
				{ error: 'Customer name and at least one item are required' },
				{ status: 400 }
			);
		}

		console.log(`Processing order with ${data.items.length} items`);

		// Extract item IDs for batch validation
		const itemIds = (data.items as OrderItemInput[]).map(item => item.itemId);
		
		// Validate all items OUTSIDE the transaction first
		console.log('Validating items:', itemIds);
		const foundItems = await prisma.item.findMany({
			where: { id: { in: itemIds } }
		});

		// Check if all items exist and validate data
		const itemMap = new Map(foundItems.map(item => [item.id, item]));
		
		for (const item of data.items as OrderItemInput[]) {
			console.log('Validating item:', item);
			
			const foundItem = itemMap.get(item.itemId);
			if (!foundItem) {
				console.error(`Item not found: ${item.itemId}`);
				throw new Error(`Item with ID ${item.itemId} not found`);
			}

			if (!foundItem.inStock) {
				console.error(`Item out of stock: ${foundItem.name}`);
				throw new Error(`Item "${foundItem.name}" is out of stock`);
			}

			// Validate item data structure
			if (!item.quantity || item.quantity <= 0) {
				throw new Error(`Invalid quantity for item "${foundItem.name}"`);
			}

			if (!item.price || item.price <= 0) {
				throw new Error(`Invalid price for item "${foundItem.name}"`);
			}
		}

		console.log('All items validated successfully, creating order...');

		// Now use a much simpler transaction with increased timeout
		const result = await prisma.$transaction(async tx => {
			// Create the order with all order items in one operation
			const newOrder = await tx.order.create({
				data: {
					customerName: data.customerName,
					customMessage: data.customMessage,
					status: OrderStatus.COMPLETED,
					orderItems: {
						create: (data.items as OrderItemInput[]).map(item => ({
							quantity: item.quantity,
							price: item.price,
							item: {
								connect: { id: item.itemId }
							}
						}))
					}
				},
				include: {
					orderItems: {
						include: {
							item: true
						}
					}
				}
			});

			console.log('Order created successfully:', newOrder.id);
			return newOrder;
		}, {
			timeout: 10000, // Increase timeout to 10 seconds
			maxWait: 5000,  // Maximum time to wait for a transaction slot
		});

		return NextResponse.json(result, { status: 201 });
	} catch (error) {
		console.error('Error creating order:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

// PUT /api/orders/:id - Update an order
export async function PUT(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const id = url.pathname.split('/').pop() as string;
		const data = await req.json();

		// Find order
		const order = await prisma.order.findUnique({
			where: { id },
			include: {
				orderItems: {
					include: {
						item: true
					}
				}
			}
		});

		if (!order) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}

		// Update order with allowed fields
		const updatedOrder = await prisma.order.update({
			where: { id },
			data: {
				customerName: data.customerName || order.customerName,
				customMessage: data.customMessage || order.customMessage
			},
			include: {
				orderItems: {
					include: {
						item: true
					}
				},
				bill: true
			}
		});

		return NextResponse.json(updatedOrder);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

// DELETE /api/orders/:id - Delete an order
export async function DELETE(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const id = url.pathname.split('/').pop() as string;

		// Find order to check if it exists
		const order = await prisma.order.findUnique({
			where: { id },
			include: {
				bill: true
			}
		});

		if (!order) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}

		// Use transaction to delete related records properly
		await prisma.$transaction(async tx => {
			// Delete associated bill if it exists
			if (order.bill) {
				await tx.bill.delete({
					where: { id: order.bill.id }
				});
			}

			// Delete order items
			await tx.orderItem.deleteMany({
				where: { orderId: id }
			});

			// Delete the order
			await tx.order.delete({
				where: { id }
			});
		});

		return NextResponse.json({
			success: true,
			message: 'Order deleted successfully'
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
