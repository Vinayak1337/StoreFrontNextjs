import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
					},
					orderBy: {
						id: 'desc' // Sort by ID descending as proxy for creation date
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

		let updatedOrder;
		if (Array.isArray(data.items)) {
			// Replace order items with provided payload
			updatedOrder = await prisma.$transaction(async tx => {
				await tx.order.update({
					where: { id },
					data: {
						customerName: data.customerName || order.customerName,
						customMessage: data.customMessage || order.customMessage
					}
				});
				await tx.orderItem.deleteMany({ where: { orderId: id } });
				if (data.items.length > 0) {
					await tx.orderItem.createMany({
						data: data.items.map(
							(i: { itemId: string; quantity: number; price: number }) => ({
								orderId: id,
								itemId: i.itemId,
								quantity: i.quantity,
								price: i.price
							})
						)
					});
				}
				return tx.order.findUnique({
					where: { id },
					include: {
						orderItems: { include: { item: true } }
					}
				});
			});
		} else {
			// Only fields update
			updatedOrder = await prisma.order.update({
				where: { id },
				data: {
					customerName: data.customerName || order.customerName,
					customMessage: data.customMessage || order.customMessage
				},
				include: {
					orderItems: { include: { item: true } }
				}
			});
		}

		return NextResponse.json(updatedOrder);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

// DELETE /api/orders/[id] - Delete a specific order
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		// Check if order exists
		const order = await prisma.order.findUnique({
			where: { id },
			include: {
				orderItems: true
			}
		});

		if (!order) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}

		// Start a transaction to delete related data
		await prisma.$transaction(async tx => {
			if (order.orderItems.length > 0) {
				await tx.orderItem.deleteMany({
					where: { orderId: id }
				});
			}

			// Delete the order itself
			await tx.order.delete({
				where: { id }
			});
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
