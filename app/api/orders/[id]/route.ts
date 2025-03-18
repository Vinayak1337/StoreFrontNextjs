import { NextRequest, NextResponse } from 'next/server';
import { sampleOrders, sampleItems, sampleBills } from '@/lib/mocks/data';
import { OrderStatus } from '@/types';

// Create mutable copies for operations
const ordersData = [...sampleOrders];

// GET /api/orders/[id] - Get a specific order
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = Number(params.id);
		const order = ordersData.find(order => order.id === id);

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
	{ params }: { params: { id: string } }
) {
	try {
		const id = Number(params.id);
		const data = await request.json();

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
