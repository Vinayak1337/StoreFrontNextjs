'use server';

import { cache } from 'react';
import prisma from '@/lib/prisma';

interface OrderItemInput {
	itemId: string;
	quantity: number;
	price: number;
}

export const getOrders = cache(async () => {
	const orders = await prisma.$queryRaw<Array<BasicOrder>>`
		SELECT 
			o.id,
			o.customer_name as "customerName",
			o.custom_message as "customMessage",
			o.created_at as "createdAt",
			o.created_at as "updatedAt",
			COALESCE(COUNT(oi.id), 0) as "itemsCount",
			COALESCE(SUM(oi.price * oi.quantity), 0) as "totalAmount"
		FROM orders o
		LEFT JOIN order_items oi ON o.id = oi.order_id
		WHERE o.archived = false
		GROUP BY o.id, o.customer_name, o.custom_message, o.created_at
		ORDER BY o.created_at DESC
	`;

	return orders.map(order => ({
		...order,
		itemsCount: Number(order.itemsCount),
		totalAmount: Number(order.totalAmount)
	}));
});

export const getArchivedOrders = cache(async () => {
	const orders = await prisma.$queryRaw<Array<BasicOrder>>`
		SELECT 
			o.id,
			o.customer_name as "customerName",
			o.custom_message as "customMessage",
			o.created_at as "createdAt",
			o.created_at as "updatedAt",
			COALESCE(COUNT(oi.id), 0) as "itemsCount",
			COALESCE(SUM(oi.price * oi.quantity), 0) as "totalAmount"
		FROM orders o
		LEFT JOIN order_items oi ON o.id = oi.order_id
		WHERE o.archived = true
		GROUP BY o.id, o.customer_name, o.custom_message, o.created_at
		ORDER BY o.created_at DESC
	`;

	return orders.map(order => ({
		...order,
		itemsCount: Number(order.itemsCount),
		totalAmount: Number(order.totalAmount)
	}));
});

export const getOrderById = cache(async (id: string) => {
	const order = await prisma.order.findUnique({
		where: { id },
		include: {
			orderItems: {
				include: {
					item: {
						select: { id: true, name: true, price: true }
					}
				}
			}
		}
	});

	if (!order) return null;

	return {
		...order,
		orderItems: order.orderItems.map(orderItem => ({
			...orderItem,
			price: Number(orderItem.price),
			item: orderItem.item
				? {
						...orderItem.item,
						price: Number(orderItem.item.price)
				  }
				: null
		}))
	} as unknown as Order;
});

export const createOrder = async (data: {
	customerName: string;
	customMessage?: string;
	items: OrderItemInput[];
}) => {
	if (
		!data.customerName ||
		!Array.isArray(data.items) ||
		data.items.length === 0
	) {
		throw new Error('Customer name and at least one item are required');
	}

	const itemIds = data.items.map(item => item.itemId);

	const foundItems = await prisma.item.findMany({
		where: {
			id: { in: itemIds },
			inStock: true
		},
		select: { id: true, name: true, inStock: true }
	});

	const foundItemIds = new Set(foundItems.map(item => item.id));

	for (const item of data.items) {
		if (!foundItemIds.has(item.itemId)) {
			throw new Error(`Item not found or out of stock: ${item.itemId}`);
		}

		if (
			!item.quantity ||
			item.quantity <= 0 ||
			!item.price ||
			item.price <= 0
		) {
			throw new Error('Invalid item quantity or price');
		}
	}

	const result = await prisma.$transaction(
		async tx => {
			return await tx.order.create({
				data: {
					customerName: data.customerName,
					customMessage: data.customMessage,
					status: 'COMPLETED',
					orderItems: {
						create: data.items.map(item => ({
							quantity: item.quantity,
							price: item.price,
							itemId: item.itemId
						}))
					}
				},
				include: {
					orderItems: {
						include: {
							item: {
								select: { id: true, name: true, price: true }
							}
						}
					}
				}
			});
		},
		{
			timeout: 5000,
			maxWait: 2000
		}
	);

	// Convert Decimal objects to numbers for client components
	return {
		...result,
		orderItems: result.orderItems.map(orderItem => ({
			...orderItem,
			price: Number(orderItem.price),
			item: orderItem.item
				? {
						...orderItem.item,
						price: Number(orderItem.item.price)
				  }
				: null
		}))
	};
};

export const updateOrder = async (
	id: string,
	data: {
		customerName?: string;
		customMessage?: string;
	}
) => {
	const order = await prisma.order.findUnique({
		where: { id },
		include: {
			orderItems: {
				include: {
					item: true
				}
			}
		}
	});

	if (!order) {
		throw new Error('Order not found');
	}

	const updatedOrder = await prisma.order.update({
		where: { id },
		data: {
			customerName: data.customerName || order.customerName,
			customMessage: data.customMessage || order.customMessage
		},
		include: {
			orderItems: {
				include: {
					item: true
				}
			}
		}
	});

	// Convert Decimal objects to numbers for client components
	return {
		...updatedOrder,
		orderItems: updatedOrder.orderItems.map(orderItem => ({
			...orderItem,
			price: Number(orderItem.price),
			item: orderItem.item
				? {
						...orderItem.item,
						price: Number(orderItem.item.price)
				  }
				: null
		}))
	};
};

export const updateOrderWithItems = async (
	id: string,
	data: {
		customerName?: string;
		customMessage?: string;
		items: OrderItemInput[];
	}
) => {
	if (!Array.isArray(data.items)) {
		throw new Error('Items payload is required');
	}

	// Validate items
	for (const item of data.items) {
		if (
			!item.itemId ||
			!item.quantity ||
			item.quantity <= 0 ||
			item.price === undefined ||
			item.price <= 0
		) {
			throw new Error('Invalid order item payload');
		}
	}

	const order = await prisma.order.findUnique({ where: { id } });
	if (!order) {
		throw new Error('Order not found');
	}

	const updated = await prisma.$transaction(async tx => {
		// Update order fields
		await tx.order.update({
			where: { id },
			data: {
				customerName: data.customerName ?? order.customerName,
				customMessage: data.customMessage ?? order.customMessage
			}
		});

		// Replace items: delete existing then create provided
		await tx.orderItem.deleteMany({ where: { orderId: id } });
		await tx.orderItem.createMany({
			data: data.items.map(i => ({
				orderId: id,
				itemId: i.itemId,
				quantity: i.quantity,
				// Prisma Decimal accepts number; client ensured number
				price: i.price
			}))
		});

		const result = await tx.order.findUnique({
			where: { id },
			include: {
				orderItems: {
					include: {
						item: {
							select: { id: true, name: true, price: true }
						}
					}
				}
			}
		});
		return result!;
	});

	// Convert Decimal objects to numbers for client components
	return {
		...updated,
		orderItems: updated.orderItems.map(orderItem => ({
			...orderItem,
			price: Number(orderItem.price),
			item: orderItem.item
				? {
						...orderItem.item,
						price: Number(orderItem.item.price)
				  }
				: null
		}))
	} as unknown as Order;
};

export const archiveOrder = async (id: string) => {
	const order = await prisma.order.findUnique({
		where: { id }
	});

	if (!order) {
		throw new Error('Order not found');
	}

	await prisma.order.update({
		where: { id },
		data: { archived: true }
	});

	return { success: true, message: 'Order archived successfully' };
};

export const unarchiveOrder = async (id: string) => {
	const order = await prisma.order.findUnique({
		where: { id }
	});

	if (!order) {
		throw new Error('Order not found');
	}

	await prisma.order.update({
		where: { id },
		data: { archived: false }
	});

	return { success: true, message: 'Order unarchived successfully' };
};

export const deleteOrder = async (id: string) => {
	const order = await prisma.order.findUnique({
		where: { id }
	});

	if (!order) {
		throw new Error('Order not found');
	}

	await prisma.$transaction(async tx => {
		await tx.orderItem.deleteMany({
			where: { orderId: id }
		});

		await tx.order.delete({
			where: { id }
		});
	});

	return { success: true, message: 'Order deleted successfully' };
};

export const getOrdersStats = cache(
	async (): Promise<{
		totalOrders: number;
		todayOrders: number;
		pendingOrders: number;
		completedOrders: number;
	}> => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const [totalOrders, todayOrders, pendingOrders, completedOrders] =
			await Promise.all([
				prisma.order.count(),
				prisma.order.count({
					where: {
						createdAt: {
							gte: today
						}
					}
				}),
				prisma.order.count({
					where: {
						status: 'PENDING'
					}
				}),
				prisma.order.count({
					where: {
						status: 'COMPLETED'
					}
				})
			]);

		return {
			totalOrders,
			todayOrders,
			pendingOrders,
			completedOrders
		};
	}
);
