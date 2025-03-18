import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sampleOrders, sampleItems, sampleBills } from '@/lib/mocks/data';
import { Order, OrderStatus } from '@/types';

// Use mutable copies for operations
const ordersData = [...sampleOrders];
let orderId = ordersData.length + 1;

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

		// Validate and prepare items
		const orderItems = data.items.map(
			(item: { itemId: number; quantity: number; price: number }) => {
				const foundItem = sampleItems.find(i => i.id === item.itemId);

				if (!foundItem) {
					throw new Error(`Item with ID ${item.itemId} not found`);
				}

				if (foundItem.quantity < item.quantity) {
					throw new Error(`Not enough stock for item: ${foundItem.name}`);
				}

				return {
					itemId: item.itemId,
					name: foundItem.name,
					quantity: item.quantity,
					price: item.price || foundItem.price
				};
			}
		);

		// Create new order
		const newOrder: Order = {
			id: orderId++,
			customerName: data.customerName,
			status: OrderStatus.PENDING,
			items: orderItems,
			date: new Date().toISOString()
		};

		// Add to orders
		ordersData.push(newOrder);

		// Update inventory (reduce quantities)
		orderItems.forEach((item: { itemId: number; quantity: number }) => {
			const inventoryItem = sampleItems.find(i => i.id === item.itemId);
			if (inventoryItem) {
				inventoryItem.quantity -= item.quantity;
			}
		});

		return NextResponse.json(newOrder, { status: 201 });
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
