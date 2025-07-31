'use server';

import { cache } from 'react';
import prisma from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

interface OrderItemInput {
	itemId: string;
	quantity: number;
	price: number;
}

export const getOrders = cache(async () => {
	const orders = await prisma.order.findMany({
		take: 100,
		include: {
			orderItems: {
				include: {
					item: {
						select: { id: true, name: true, price: true }
					}
				},
				orderBy: {
					id: 'desc'
				}
			},
			bill: {
				select: { id: true, totalAmount: true, isPaid: true }
			}
		},
		orderBy: {
			createdAt: 'desc'
		}
	});

	return orders.map(order => ({
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
		})),
		bill: order.bill
			? {
					...order.bill,
					totalAmount: Number(order.bill.totalAmount)
			  }
			: null
	})) as Order[];
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
			},
			bill: true
		}
	});

	if (!order) return null;

	// Convert Decimal objects to numbers for client components
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
		})),
		bill: order.bill
			? {
					...order.bill,
					totalAmount: Number(order.bill.totalAmount)
			  }
			: null
	};
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
					status: OrderStatus.COMPLETED,
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
			},
			bill: true
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
		})),
		bill: updatedOrder.bill
			? {
					...updatedOrder.bill,
					totalAmount: Number(updatedOrder.bill.totalAmount)
			  }
			: null
	};
};

export const deleteOrder = async (id: string) => {
	const order = await prisma.order.findUnique({
		where: { id },
		include: {
			bill: true
		}
	});

	if (!order) {
		throw new Error('Order not found');
	}

	await prisma.$transaction(async tx => {
		if (order.bill) {
			await tx.bill.delete({
				where: { id: order.bill.id }
			});
		}

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
						status: OrderStatus.PENDING
					}
				}),
				prisma.order.count({
					where: {
						status: OrderStatus.COMPLETED
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
