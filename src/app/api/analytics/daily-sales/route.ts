import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

		// Parse dates for the query
		const startDateTime = new Date(startDate);
		const endDateTime = new Date(endDate);

		// Get all bills in the date range
		const bills = await prisma.bill.findMany({
			where: {
				createdAt: {
					gte: startDateTime,
					lte: endDateTime
				}
			},
			include: {
				order: true
			}
		});

		// Group by date and calculate daily sales
		const dailySales: Record<
			string,
			{ date: string; totalAmount: number; count: number }
		> = {};

		// Process bills to calculate daily sales
		for (const bill of bills) {
			const dateString = bill.createdAt.toISOString().split('T')[0];

			if (!dailySales[dateString]) {
				dailySales[dateString] = {
					date: dateString,
					totalAmount: 0,
					count: 0
				};
			}

			dailySales[dateString].totalAmount += Number(bill.totalAmount);
			dailySales[dateString].count += 1;
		}

		// Convert to array and sort by date
		const result = Object.values(dailySales).sort((a, b) =>
			a.date.localeCompare(b.date)
		);

		return NextResponse.json(result);
	} catch (error) {
		console.error('Error fetching daily sales:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
