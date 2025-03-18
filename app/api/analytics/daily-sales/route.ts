import { NextRequest, NextResponse } from 'next/server';
import { sampleBills, sampleOrders } from '@/lib/mocks/data';
import { Bill, Order } from '@/types';

// GET /api/analytics/daily-sales - Get daily sales data
export async function GET(req: NextRequest) {
	try {
		// Get date range from query params
		const searchParams = req.nextUrl.searchParams;
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');

		if (!startDate || !endDate) {
			return NextResponse.json(
				{ error: 'Start date and end date are required' },
				{ status: 400 }
			);
		}

		// Find all bills in the date range
		const startDateTime = new Date(startDate).getTime();
		const endDateTime = new Date(endDate).getTime();

		const billsInRange = sampleBills.filter(bill => {
			const billDate = new Date(bill.date).getTime();
			return billDate >= startDateTime && billDate <= endDateTime;
		});

		// Find all orders in the date range
		const ordersInRange = sampleOrders.filter(order => {
			const orderDate = new Date(order.date).getTime();
			return orderDate >= startDateTime && orderDate <= endDateTime;
		});

		// Group by date and calculate daily sales
		const dailySales: Record<string, { date: string; sales: number }> = {};

		// Add sales from bills
		billsInRange.forEach((bill: Bill) => {
			const dateString = new Date(bill.date).toISOString().split('T')[0];

			if (!dailySales[dateString]) {
				dailySales[dateString] = {
					date: dateString,
					sales: 0
				};
			}

			dailySales[dateString].sales += Number(bill.totalAmount);
		});

		// Add sales from orders
		ordersInRange.forEach((order: Order) => {
			const dateString = new Date(order.date).toISOString().split('T')[0];

			if (!dailySales[dateString]) {
				dailySales[dateString] = {
					date: dateString,
					sales: 0
				};
			}

			const orderTotal = order.items.reduce(
				(sum, item) => sum + Number(item.price) * Number(item.quantity),
				0
			);

			dailySales[dateString].sales += orderTotal;
		});

		// Convert to array and sort by date
		const result = Object.values(dailySales).sort((a, b) =>
			a.date.localeCompare(b.date)
		);

		return NextResponse.json(result);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
