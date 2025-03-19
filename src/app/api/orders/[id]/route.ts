import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { OrderStatus } from '@/types';

// GET /api/orders/[id] - Get a specific order
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
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

		return NextResponse.json(order);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

// PUT /api/orders/[id] - Update a specific order
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const data = await request.json();

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
