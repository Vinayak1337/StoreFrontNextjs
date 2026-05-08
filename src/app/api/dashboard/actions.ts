'use server';

import { cache } from 'react';
import prisma from '@/lib/prisma';
import {
	addDays,
	endOfDay,
	formatDateKey,
	getLatestOrderDate,
	getOrderReportingWindow,
	startOfDay
} from '@/lib/server/reporting-window';

interface SalesOverviewPoint {
	date: string;
	revenue: number;
	orders: number;
	items: number;
}

interface SalesOverview {
	points: SalesOverviewPoint[];
	periodLabel: string;
	totalRevenue: number;
	totalOrders: number;
	totalItems: number;
	bestDay: SalesOverviewPoint | null;
}

async function getRevenueBetween(startDate?: Date, endDate?: Date) {
	const orderItems = await prisma.orderItem.findMany({
		where:
			startDate && endDate
				? {
						order: {
							createdAt: {
								gte: startDate,
								lte: endDate
							}
						}
				  }
				: undefined,
		select: {
			price: true,
			quantity: true
		}
	});

	return orderItems.reduce(
		(sum, item) => sum + Number(item.price) * Number(item.quantity),
		0
	);
}

function percentageChange(current: number, previous: number) {
	if (previous > 0) return ((current - previous) / previous) * 100;
	return current > 0 ? 100 : 0;
}

export const getRevenueStats = cache(async (): Promise<{
	totalRevenue: number;
	periodRevenue: number;
	previousPeriodRevenue: number;
	changePercentage: number;
}> => {
	const { startDate, endDate } = await getOrderReportingWindow(30);
	const previousEndDate = new Date(startDate.getTime() - 1);
	const previousStartDate = startOfDay(addDays(startDate, -30));

	const [totalRevenue, periodRevenue, previousPeriodRevenue] =
		await Promise.all([
			getRevenueBetween(),
			getRevenueBetween(startDate, endDate),
			getRevenueBetween(previousStartDate, previousEndDate)
		]);

	return {
		totalRevenue,
		periodRevenue,
		previousPeriodRevenue,
		changePercentage: percentageChange(periodRevenue, previousPeriodRevenue)
	};
});

export const getOrdersStats = cache(async (): Promise<{
	totalOrders: number;
	todayOrders: number;
	yesterdayOrders: number;
	changePercentage: number;
}> => {
	const latestOrderDate = await getLatestOrderDate();
	const today = startOfDay(latestOrderDate);
	const tomorrow = endOfDay(latestOrderDate);
	const yesterday = startOfDay(addDays(today, -1));

	const [totalOrders, todayOrders, yesterdayOrders] = await Promise.all([
		prisma.order.count(),
		prisma.order.count({
			where: {
				createdAt: {
					gte: today,
					lte: tomorrow
				},
			},
		}),
		prisma.order.count({
			where: {
				createdAt: {
					gte: yesterday,
					lt: today,
				},
			},
		}),
	]);

	const changePercentage = yesterdayOrders > 0 
		? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 
		: todayOrders > 0 ? 100 : 0;

	return {
		totalOrders,
		todayOrders,
		yesterdayOrders,
		changePercentage,
	};
});

export const getItemsInStock = cache(async (): Promise<{
	totalInStock: number;
	todayAdded: number;
	yesterdayAdded: number;
	changePercentage: number;
}> => {
	const latestItem = await prisma.item.findFirst({
		select: { createdAt: true },
		orderBy: { createdAt: 'desc' }
	});
	const anchorDate = latestItem?.createdAt ?? new Date();
	const today = startOfDay(anchorDate);
	const tomorrow = endOfDay(anchorDate);
	const yesterday = startOfDay(addDays(today, -1));

	const [totalInStock, todayAdded, yesterdayAdded] = await Promise.all([
		prisma.item.count({
			where: {
				inStock: true,
			},
		}),
		prisma.item.count({
			where: {
				inStock: true,
				createdAt: {
					gte: today,
					lte: tomorrow
				},
			},
		}),
		prisma.item.count({
			where: {
				inStock: true,
				createdAt: {
					gte: yesterday,
					lt: today,
				},
			},
		}),
	]);

	const changePercentage = yesterdayAdded > 0 
		? ((todayAdded - yesterdayAdded) / yesterdayAdded) * 100 
		: todayAdded > 0 ? 100 : 0;

	return {
		totalInStock,
		todayAdded,
		yesterdayAdded,
		changePercentage,
	};
});

export const getConversionRate = cache(async (): Promise<{
	conversionRate: number;
	changePercentage: number;
}> => {
	const { startDate, endDate } = await getOrderReportingWindow(30);
	const previousEndDate = new Date(startDate.getTime() - 1);
	const previousStartDate = startOfDay(addDays(startDate, -30));

	async function getRetentionRateForPeriod(periodStart: Date, periodEnd: Date) {
		const orders = await prisma.order.findMany({
			where: {
				createdAt: {
					gte: periodStart,
					lte: periodEnd,
				},
			},
			select: {
				customerName: true,
			},
		});

		const orderCounts = new Map<string, number>();
		for (const order of orders) {
			const customerName = order.customerName.trim().toLowerCase();
			orderCounts.set(customerName, (orderCounts.get(customerName) ?? 0) + 1);
		}

		if (orderCounts.size === 0) return 0;

		const returningCustomers = [...orderCounts.values()].filter(
			count => count > 1
		).length;
		return (returningCustomers / orderCounts.size) * 100;
	}

	const [retentionRate, previousRetentionRate] = await Promise.all([
		getRetentionRateForPeriod(startDate, endDate),
		getRetentionRateForPeriod(previousStartDate, previousEndDate)
	]);

	return {
		conversionRate: retentionRate,
		changePercentage: percentageChange(retentionRate, previousRetentionRate),
	};
});

export const getSalesOverview = cache(async (): Promise<SalesOverview> => {
	const { startDate, endDate, periodLabel } = await getOrderReportingWindow(30);
	const buckets = new Map<string, SalesOverviewPoint>();
	const currentDate = startOfDay(startDate);

	while (currentDate <= endDate) {
		const date = formatDateKey(currentDate);
		buckets.set(date, {
			date,
			revenue: 0,
			orders: 0,
			items: 0
		});
		currentDate.setDate(currentDate.getDate() + 1);
	}

	const orders = await prisma.order.findMany({
		where: {
			createdAt: {
				gte: startDate,
				lte: endDate
			},
		},
		select: {
			createdAt: true,
			orderItems: {
				select: {
					price: true,
					quantity: true
				}
			}
		},
	});

	for (const order of orders) {
		const date = formatDateKey(order.createdAt);
		const bucket = buckets.get(date);
		if (!bucket) continue;

		const orderRevenue = order.orderItems.reduce(
			(sum, item) => sum + Number(item.price) * Number(item.quantity),
			0
		);
		const orderItems = order.orderItems.reduce(
			(sum, item) => sum + Number(item.quantity),
			0
		);

		bucket.revenue += orderRevenue;
		bucket.orders += 1;
		bucket.items += orderItems;
	}

	const points = [...buckets.values()];
	const totalRevenue = points.reduce((sum, point) => sum + point.revenue, 0);
	const totalOrders = points.reduce((sum, point) => sum + point.orders, 0);
	const totalItems = points.reduce((sum, point) => sum + point.items, 0);
	const bestDay =
		points.length > 0
			? points.reduce((best, point) =>
					point.revenue > best.revenue ? point : best
			  )
			: null;

	return {
		points,
		periodLabel,
		totalRevenue,
		totalOrders,
		totalItems,
		bestDay
	};
});

export const getRecentOrders = cache(async (): Promise<Array<{
	id: string;
	createdAt: Date;
	customerName: string;
	totalPrice: number;
	itemCount: number;
}>> => {
	const orders = await prisma.$queryRaw<Array<{
		id: string;
		createdAt: Date;
		customerName: string;
		totalPrice: number;
		itemCount: number;
	}>>`
		SELECT 
			o.id,
			o.created_at as "createdAt",
			o.customer_name as "customerName",
			COALESCE(SUM(oi.price * oi.quantity), 0) as "totalPrice",
			COALESCE(SUM(oi.quantity), 0) as "itemCount"
		FROM orders o
		LEFT JOIN order_items oi ON o.id = oi.order_id
		GROUP BY o.id, o.created_at, o.customer_name
		ORDER BY o.created_at DESC
		LIMIT 5
	`;

	return orders.map(order => ({
		...order,
		totalPrice: Number(order.totalPrice),
		itemCount: Number(order.itemCount),
	}));
});
