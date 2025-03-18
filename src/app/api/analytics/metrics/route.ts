import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { OrderStatus } from '@/types';

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

		// Count total completed orders
		const completedOrders = await prisma.order.count({
			where: {
				createdAt: {
					gte: startDateTime,
					lte: endDateTime
				},
				status: OrderStatus.COMPLETED
			}
		});

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
			totalOrders > 0 ? totalSales / completedOrders : 0;
		const conversionRate =
			totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

		// Get top selling items
		const topSellingItems = await prisma.orderItem.groupBy({
			by: ['itemId'],
			where: {
				order: {
					createdAt: {
						gte: startDateTime,
						lte: endDateTime
					},
					status: OrderStatus.COMPLETED
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
			topSellingItems.map(async item => {
				const itemDetails = await prisma.item.findUnique({
					where: { id: item.itemId }
				});

				return {
					id: item.itemId,
					name: itemDetails?.name || 'Unknown Item',
					quantity: item._sum.quantity || 0,
					revenue: (item._sum.price || 0) * (item._sum.quantity || 0)
				};
			})
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
		paymentMethods.forEach(method => {
			paymentMethodDistribution[method.paymentMethod] = method._count;
		});

		// Build metrics object
		const metrics = {
			totalOrders,
			totalSales,
			averageOrderValue,
			completedOrders,
			conversionRate,
			topSellingItems: topItems,
			paymentMethodDistribution
		};

		return NextResponse.json(metrics);
	} catch (error) {
		console.error('Error fetching analytics metrics:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
