'use server';

import { cache } from 'react';
import prisma from '@/lib/prisma';

interface AnalyticsMetrics {
	totalOrders: number;
	totalSales: number;
	averageOrderValue: number;
	ordersTrend: number;
	revenueTrend: number;
	topSellingItems: Array<{
		id: string;
		name: string;
		quantity: number;
		revenue: number;
	}>;
}

interface DailySalesData {
	date: string;
	totalAmount: number;
	count: number;
	sales: number;
	orderCount: number;
}

export const getAnalyticsMetrics = cache(async (
	startDate?: string,
	endDate?: string
): Promise<AnalyticsMetrics> => {
	const startDateTime = startDate 
		? new Date(startDate)
		: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
	const endDateTime = endDate ? new Date(endDate) : new Date();

	const totalOrders = await prisma.order.count({
		where: {
			createdAt: {
				gte: startDateTime,
				lte: endDateTime
			}
		}
	});

	const orderItems = await prisma.orderItem.findMany({
		where: {
			order: {
				createdAt: {
					gte: startDateTime,
					lte: endDateTime
				}
			}
		},
		select: {
			price: true,
			quantity: true
		}
	});

	const totalSales = orderItems.reduce((sum, item) => {
		return sum + (Number(item.price) * Number(item.quantity));
	}, 0);

	const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

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

	const topItems = await Promise.all(
		topSellingItems.map(async (item) => {
			const itemDetails = await prisma.item.findUnique({
				where: { id: item.itemId }
			});

			return {
				id: item.itemId,
				name: itemDetails?.name || 'Unknown Item',
				quantity: item._sum.quantity || 0,
				revenue: Number(item._sum.price || 0) * Number(item._sum.quantity || 0)
			};
		})
	);

	const periodDays = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24));
	const previousStartDate = new Date(startDateTime.getTime() - (periodDays * 24 * 60 * 60 * 1000));
	const previousEndDate = new Date(startDateTime.getTime() - 1);

	const prevTotalOrders = await prisma.order.count({
		where: {
			createdAt: {
				gte: previousStartDate,
				lte: previousEndDate
			}
		}
	});

	const prevOrderItems = await prisma.orderItem.findMany({
		where: {
			order: {
				createdAt: {
					gte: previousStartDate,
					lte: previousEndDate
				}
			}
		},
		select: {
			price: true,
			quantity: true
		}
	});

	const prevTotalSales = prevOrderItems.reduce((sum, item) => {
		return sum + (Number(item.price) * Number(item.quantity));
	}, 0);

	const ordersTrend = prevTotalOrders > 0 ? 
		((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 : 0;
	const revenueTrend = prevTotalSales > 0 ? 
		((totalSales - prevTotalSales) / prevTotalSales) * 100 : 0;

	return {
		totalOrders,
		totalSales,
		averageOrderValue,
		ordersTrend,
		revenueTrend,
		topSellingItems: topItems
	};
});

export const getDailySales = cache(async (
	startDate: string, 
	endDate: string
): Promise<DailySalesData[]> => {
	const startDateTime = new Date(startDate);
	const endDateTime = new Date(endDate);

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

	const dailySales: Record<string, { date: string; totalAmount: number; count: number }> = {};

	for (const order of orders) {
		const dateString = order.createdAt.toISOString().split('T')[0];

		if (!dailySales[dateString]) {
			dailySales[dateString] = {
				date: dateString,
				totalAmount: 0,
				count: 0
			};
		}

		const orderTotal = order.orderItems.reduce((sum, item) => {
			return sum + (Number(item.price) * Number(item.quantity));
		}, 0);

		dailySales[dateString].totalAmount += orderTotal;
		dailySales[dateString].count += 1;
	}

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

	const result = Object.values(dailySales)
		.sort((a, b) => a.date.localeCompare(b.date))
		.map(item => ({
			date: item.date,
			totalAmount: item.totalAmount,
			count: item.count,
			sales: item.totalAmount, // For compatibility
			orderCount: item.count // For compatibility
		}));

	return result;
});

export const getTodayStats = cache(async () => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	const todayOrders = await prisma.order.findMany({
		where: {
			createdAt: {
				gte: today,
				lt: tomorrow
			}
		},
		include: {
			orderItems: true
		}
	});

	const todayRevenue = todayOrders.reduce((sum, order) => {
		return sum + order.orderItems.reduce((orderSum, item) => {
			return orderSum + (Number(item.price) * Number(item.quantity));
		}, 0);
	}, 0);

	const averageOrderValue = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;

	return {
		ordersCount: todayOrders.length,
		revenue: todayRevenue,
		averageOrderValue
	};
});