import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Define the expected item structure for order creation
interface OrderItemInput {
	itemId: string;
	quantity: number;
	price: number;
}

export async function getOrders() {
	const orders = await prisma.order.findMany({
		take: 100, // Limit to 100 most recent orders
		include: {
			orderItems: {
				include: {
					item: {
						select: { id: true, name: true, price: true } // Only necessary fields
					}
				},
				orderBy: {
					id: 'desc'
				}
			},
			bill: {
				select: { id: true, totalAmount: true, isPaid: true } // Only necessary fields
			}
		},
		orderBy: {
			createdAt: 'desc'
		}
	});

	return orders;
}

// GET /api/orders - Get all orders
export async function GET() {
	try {
		const orders = await getOrders();
		return NextResponse.json(orders);
	} catch {
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
		
		// Validate required fields
		if (
			!data.customerName ||
			!Array.isArray(data.items) ||
			data.items.length === 0
		) {
			return NextResponse.json(
				{ error: 'Customer name and at least one item are required' },
				{ status: 400 }
			);
		}

		// Extract item IDs for batch validation
		const itemIds = (data.items as OrderItemInput[]).map(item => item.itemId);
		
		// Validate all items OUTSIDE the transaction first
		const foundItems = await prisma.item.findMany({
			where: { 
				id: { in: itemIds },
				inStock: true // Only get items that are in stock
			},
			select: { id: true, name: true, inStock: true } // Only select necessary fields
		});

		// Quick validation using Set for O(1) lookup
		const foundItemIds = new Set(foundItems.map(item => item.id));
		
		// Validate all items exist and are in stock
		for (const item of data.items as OrderItemInput[]) {
			if (!foundItemIds.has(item.itemId)) {
				return NextResponse.json(
					{ error: `Item not found or out of stock: ${item.itemId}` },
					{ status: 400 }
				);
			}

			// Basic validation
			if (!item.quantity || item.quantity <= 0 || !item.price || item.price <= 0) {
				return NextResponse.json(
					{ error: 'Invalid item quantity or price' },
					{ status: 400 }
				);
			}
		}

		// Optimized transaction with shorter timeout for Vercel
		const result = await prisma.$transaction(async tx => {
			// Create the order with all order items in one operation
			return await tx.order.create({
				data: {
					customerName: data.customerName,
					customMessage: data.customMessage,
					orderItems: {
						create: (data.items as OrderItemInput[]).map(item => ({
							quantity: item.quantity,
							price: item.price,
							itemId: item.itemId // Direct foreign key instead of connect
						}))
					}
				},
				include: {
					orderItems: {
						include: {
							item: {
								select: { id: true, name: true, price: true } // Only necessary fields
							}
						}
					}
				}
			});
		}, {
			timeout: 5000, // Reduced timeout for Vercel (5 seconds)
			maxWait: 2000,  // Reduced max wait time
		});

		return NextResponse.json(result, { status: 201 });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
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
