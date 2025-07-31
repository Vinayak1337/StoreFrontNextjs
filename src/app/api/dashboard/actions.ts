'use server';

import { cache } from 'react';
import prisma from '@/lib/prisma';

export const getTotalRevenue = cache(async (): Promise<number> => {
	const result = await prisma.orderItem.aggregate({
		_sum: {
			price: true,
		},
	});
	
	return Number(result._sum.price) || 0;
});

export const getOrdersStats = cache(async (): Promise<{
	totalOrders: number;
	todayOrders: number;
	yesterdayOrders: number;
	changePercentage: number;
}> => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	
	const [totalOrders, todayOrders, yesterdayOrders] = await Promise.all([
		prisma.order.count(),
		prisma.order.count({
			where: {
				createdAt: {
					gte: today,
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
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

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
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	const [todayOrders, yesterdayOrders, totalItems] = await Promise.all([
		prisma.order.count({
			where: {
				createdAt: {
					gte: today,
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
		prisma.item.count(),
	]);

	const todayConversionRate = totalItems > 0 ? (todayOrders / totalItems) * 100 : 0;
	const yesterdayConversionRate = totalItems > 0 ? (yesterdayOrders / totalItems) * 100 : 0;
	
	const changePercentage = yesterdayConversionRate > 0 
		? ((todayConversionRate - yesterdayConversionRate) / yesterdayConversionRate) * 100 
		: todayConversionRate > 0 ? 100 : 0;

	return {
		conversionRate: todayConversionRate,
		changePercentage,
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