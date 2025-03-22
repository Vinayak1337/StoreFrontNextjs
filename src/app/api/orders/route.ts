import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { OrderStatus } from '@/types';

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

		// Start a transaction
		const result = await prisma.$transaction(async tx => {
			// Validate and check items availability
			for (const item of data.items as OrderItemInput[]) {
				const foundItem = await tx.item.findUnique({
					where: { id: item.itemId }
				});

				if (!foundItem) {
					throw new Error(`Item with ID ${item.itemId} not found`);
				}

				if (!foundItem.inStock) {
					throw new Error(`Not enough stock for item: ${foundItem.name}`);
				}
			}

			// Create new order with order items
			const newOrder = await tx.order.create({
				data: {
					customerName: data.customerName,
					status: OrderStatus.PENDING,
					customMessage: data.customMessage,
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

			// Remove inventory quantity update since we're only using inStock flag now
			// No need to decrement quantities

			return newOrder;
		});

		return NextResponse.json(result, { status: 201 });
	} catch (error) {
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

		// Validate status change
		if (data.status && Object.values(OrderStatus).includes(data.status)) {
			// Handle status change
			if (
				data.status === OrderStatus.COMPLETED &&
				order.status === OrderStatus.PENDING
			) {
				// Calculate total amount
				const totalAmount = order.orderItems.reduce(
					(sum: number, item: { price: unknown; quantity: unknown }) =>
						sum + Number(item.price) * Number(item.quantity),
					0
				);

				// Apply tax rate (e.g., 5%)
				const taxRate = 0.05;
				const taxes = totalAmount * taxRate;

				// Create a bill when order is completed
				await prisma.bill.create({
					data: {
						totalAmount,
						taxes,
						paymentMethod: data.paymentMethod || 'CASH',
						orderId: order.id
					}
				});
			} else if (
				data.status === OrderStatus.CANCELLED &&
				order.status === OrderStatus.PENDING
			) {
				// No need to return items to inventory since we're only using inStock flag
				// No inventory quantity changes when canceling orders
			}

			// Update order status
			const updatedOrder = await prisma.order.update({
				where: { id },
				data: {
					status: data.status
				},
				include: {
					orderItems: {
						include: {
							item: true
						}
					}
				}
			});

			return NextResponse.json(updatedOrder);
		}

		return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
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

		return NextResponse.json({ message: 'Order deleted successfully' });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
