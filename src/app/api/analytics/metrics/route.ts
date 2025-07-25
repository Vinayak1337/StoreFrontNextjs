import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/analytics/metrics - Get analytics metrics
export async function GET(req: NextRequest) {
	try {
		// Get date range from query params, default to last 30 days
		const searchParams = req.nextUrl.searchParams;
		const startDate =
			searchParams.get('startDate') ||
			new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
		const endDate = searchParams.get('endDate') || new Date().toISOString();

		// Parse dates for the query
		const startDateTime = new Date(startDate);
		const endDateTime = new Date(endDate);

		// Count total orders
		const totalOrders = await prisma.order.count({
			where: {
				createdAt: {
					gte: startDateTime,
					lte: endDateTime
				}
			}
		});

		// Set default values for status counts (not used in logic)
		const pendingOrders = 0;
		const completedOrders = totalOrders;
		const cancelledOrders = 0;

		// Count printed orders (orders with bills)
		const printedOrders = await prisma.order.count({
			where: {
				createdAt: {
					gte: startDateTime,
					lte: endDateTime
				},
				bill: {
					isNot: null
				}
			}
		});

		// Since orders are automatically completed/billed, unpaid bills is always 0
		const unpaidBills = 0;

		// Get total sales from bills
		const billsAggregate = await prisma.bill.aggregate({
			where: {
				createdAt: {
					gte: startDateTime,
					lte: endDateTime
				}
			},
			_sum: {
				totalAmount: true
			}
		});

		const totalSales = Number(billsAggregate._sum.totalAmount || 0);
		const averageOrderValue =
			printedOrders > 0 ? totalSales / printedOrders : 0;
		const conversionRate =
			totalOrders > 0 ? (printedOrders / totalOrders) * 100 : 0;
		const printRate = 
			totalOrders > 0 ? (printedOrders / totalOrders) * 100 : 0;

		// Get top selling items - show ALL orders regardless of status
		const topSellingItems = await prisma.orderItem.groupBy({
			by: ['itemId'],
			where: {
				order: {
					createdAt: {
						gte: startDateTime,
						lte: endDateTime
					}
				}
			},
			_sum: {
				quantity: true,
				price: true
			},
			orderBy: {
				_sum: {
					quantity: 'desc'
				}
			},
			take: 5
		});

		// Get item details for top selling items
		const topItems = await Promise.all(
			topSellingItems.map(
				async (item: {
					itemId: string;
					_sum: { quantity: number | null; price: unknown | null };
				}) => {
					const itemDetails = await prisma.item.findUnique({
						where: { id: item.itemId }
					});

					return {
						id: item.itemId,
						name: itemDetails?.name || 'Unknown Item',
						quantity: item._sum.quantity || 0,
						revenue:
							Number(item._sum.price || 0) * Number(item._sum.quantity || 0)
					};
				}
			)
		);

		// Get payment method distribution
		const paymentMethods = await prisma.bill.groupBy({
			by: ['paymentMethod'],
			where: {
				createdAt: {
					gte: startDateTime,
					lte: endDateTime
				}
			},
			_count: true
		});

		const paymentMethodDistribution: Record<string, number> = {};
		paymentMethods.forEach(
			(method: { paymentMethod: string; _count: number }) => {
				paymentMethodDistribution[method.paymentMethod] = method._count;
			}
		);

		// Calculate trend data (compare with previous period)
		const periodDays = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24));
		const previousStartDate = new Date(startDateTime.getTime() - (periodDays * 24 * 60 * 60 * 1000));
		const previousEndDate = new Date(startDateTime.getTime() - 1);

		// Previous period metrics for comparison
		const prevTotalOrders = await prisma.order.count({
			where: {
				createdAt: {
					gte: previousStartDate,
					lte: previousEndDate
				}
			}
		});

		const prevBillsAggregate = await prisma.bill.aggregate({
			where: {
				createdAt: {
					gte: previousStartDate,
					lte: previousEndDate
				}
			},
			_sum: {
				totalAmount: true
			}
		});

		const prevTotalSales = Number(prevBillsAggregate._sum.totalAmount || 0);

		// Calculate trend percentages
		const ordersTrend = prevTotalOrders > 0 ? 
			((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 : 0;
		const revenueTrend = prevTotalSales > 0 ? 
			((totalSales - prevTotalSales) / prevTotalSales) * 100 : 0;
		const conversionTrend = prevTotalOrders > 0 && totalOrders > 0 ?
			((conversionRate - (prevTotalOrders > 0 ? (completedOrders / prevTotalOrders) * 100 : 0))) : 0;

		// Build metrics object
		const metrics = {
			totalOrders,
			totalSales,
			averageOrderValue,
			pendingOrders,
			completedOrders,
			cancelledOrders,
			printedOrders,
			unpaidBills,
			conversionRate,
			printRate,
			ordersTrend,
			revenueTrend,
			conversionTrend,
			topSellingItems: topItems,
			paymentMethodDistribution,
			orderStatusBreakdown: {
				pending: pendingOrders,
				completed: completedOrders,
				cancelled: cancelledOrders
			},
			printStatusBreakdown: {
				printed: printedOrders,
				unprinted: totalOrders - printedOrders
			}
		};

		return NextResponse.json(metrics);
	} catch (error) {
		console.error('Error fetching analytics metrics:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
