import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface OrderItemInput {
	itemId: string;
	quantity: number;
	price: number;
}

export async function GET() {
	try {
		const orders = await prisma.order.findMany({
			take: 100,
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
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		});
		return NextResponse.json(orders);
	} catch {
		return NextResponse.json(
			{ error: 'Failed to fetch orders' },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const data = await req.json();

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

		const itemIds = (data.items as OrderItemInput[]).map(item => item.itemId);

		const foundItems = await prisma.item.findMany({
			where: {
				id: { in: itemIds },
				inStock: true 
			},
			select: { id: true, name: true, inStock: true }
		});

		const foundItemIds = new Set(foundItems.map(item => item.id));

		for (const item of data.items as OrderItemInput[]) {
			if (!foundItemIds.has(item.itemId)) {
				return NextResponse.json(
					{ error: `Item not found or out of stock: ${item.itemId}` },
					{ status: 400 }
				);
			}

			if (
				!item.quantity ||
				item.quantity <= 0 ||
				!item.price ||
				item.price <= 0
			) {
				return NextResponse.json(
					{ error: 'Invalid item quantity or price' },
					{ status: 400 }
				);
			}
		}

		const result = await prisma.$transaction(
			async tx => {
				return await tx.order.create({
					data: {
						customerName: data.customerName,
						customMessage: data.customMessage,
						status: 'PENDING',
						orderItems: {
							create: (data.items as OrderItemInput[]).map(item => ({
								quantity: item.quantity,
								price: item.price,
								itemId: item.itemId 
							}))
						}
					},
					include: {
						orderItems: {
							include: {
								item: {
									select: { id: true, name: true, price: true } 
								}
							}
						}
					}
				});
			},
			{
				timeout: 5000,
				maxWait: 2000
			}
		);

		return NextResponse.json(result, { status: 201 });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to create order';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

export async function PUT(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const id = url.pathname.split('/').pop() as string;
		const data = await req.json();

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
				}
			}
		});

		return NextResponse.json(updatedOrder);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const id = url.pathname.split('/').pop() as string;

		const order = await prisma.order.findUnique({
			where: { id }
		});

		if (!order) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}

		await prisma.$transaction(async tx => {
			await tx.orderItem.deleteMany({
				where: { orderId: id }
			});

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
