import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function getDailySales(startDate: string, endDate: string) {
	// Parse dates for the query
	const startDateTime = new Date(startDate);
	const endDateTime = new Date(endDate);

	// Get all orders in the date range (orders serve as bills now)
	const orders = await prisma.order.findMany({
		where: {
			createdAt: {
				gte: startDateTime,
				lte: endDateTime
			}
		},
		include: {
			orderItems: true
		}
	});

	// Group by date and calculate daily sales
	const dailySales: Record<
		string,
		{ date: string; totalAmount: number; count: number }
	> = {};

	// Process orders to calculate daily sales
	for (const order of orders) {
		const dateString = order.createdAt.toISOString().split('T')[0];

		if (!dailySales[dateString]) {
			dailySales[dateString] = {
				date: dateString,
				totalAmount: 0,
				count: 0
			};
		}

		// Calculate order total from order items
		const orderTotal = order.orderItems.reduce((sum, item) => {
			return sum + (Number(item.price) * Number(item.quantity));
		}, 0);

		dailySales[dateString].totalAmount += orderTotal;
		dailySales[dateString].count += 1;
	}

	// Fill in missing dates with zero values
	const currentDate = new Date(startDateTime);
	const endDateObj = new Date(endDateTime);

	while (currentDate <= endDateObj) {
		const dateString = currentDate.toISOString().split('T')[0];
		if (!dailySales[dateString]) {
			dailySales[dateString] = {
				date: dateString,
				totalAmount: 0,
				count: 0
			};
		}
		currentDate.setDate(currentDate.getDate() + 1);
	}

	// Convert to array and sort by date
	const result = Object.values(dailySales)
		.sort((a, b) => a.date.localeCompare(b.date))
		.map(item => ({
			date: item.date,
			totalAmount: item.totalAmount, // Keep this as totalAmount to match existing code
			count: item.count, // Keep as count to match existing code
			sales: item.totalAmount, // Also include sales for compatibility
			orderCount: item.count // Also include orderCount for compatibility
		}));

	return result;
}

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

		const result = await getDailySales(startDate, endDate);
		return NextResponse.json(result);
	} catch (error) {
		console.error('Error fetching daily sales:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
