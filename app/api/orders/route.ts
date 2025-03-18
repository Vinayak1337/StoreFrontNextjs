import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { OrderStatus } from '@/types';

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
			for (const item of data.items) {
				const foundItem = await tx.item.findUnique({
					where: { id: item.itemId }
				});

				if (!foundItem) {
					throw new Error(`Item with ID ${item.itemId} not found`);
				}

				if (foundItem.quantity < item.quantity) {
					throw new Error(`Not enough stock for item: ${foundItem.name}`);
				}
			}

			// Create new order with order items
			const newOrder = await tx.order.create({
				data: {
					customerName: data.customerName,
					status: OrderStatus.PENDING,
					orderItems: {
						create: data.items.map(item => ({
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

			// Update inventory (reduce quantities)
			for (const item of data.items) {
				await tx.item.update({
					where: { id: item.itemId },
					data: {
						quantity: {
							decrement: item.quantity
						}
					}
				});
			}

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
		const id = Number(url.pathname.split('/').pop());
		const data = await req.json();

		// Find order
		const orderIndex = ordersData.findIndex(order => order.id === id);
		if (orderIndex === -1) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}

		const order = ordersData[orderIndex];

		// Validate status change
		if (data.status && Object.values(OrderStatus).includes(data.status)) {
			// Handle status change
			if (
				data.status === OrderStatus.COMPLETED &&
				order.status === OrderStatus.PENDING
			) {
				// Create a bill when order is completed
				const totalAmount = order.items.reduce(
					(sum, item) => sum + Number(item.price) * Number(item.quantity),
					0
				);

				const newBill = {
					id: sampleBills.length + 1,
					orderId: order.id,
					customerName: order.customerName,
					totalAmount: totalAmount,
					date: new Date().toISOString(),
					paymentMethod: 'cash'
				};

				sampleBills.push(newBill);
			} else if (
				data.status === OrderStatus.CANCELLED &&
				order.status === OrderStatus.PENDING
			) {
				// Return items to inventory if cancelled
				order.items.forEach(item => {
					const inventoryItem = sampleItems.find(i => i.id === item.itemId);
					if (inventoryItem) {
						inventoryItem.quantity += item.quantity;
					}
				});
			}

			// Update order status
			ordersData[orderIndex] = {
				...order,
				status: data.status
			};
		}

		return NextResponse.json(ordersData[orderIndex]);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
