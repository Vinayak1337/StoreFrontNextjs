'use server';

import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { createOrder } from '@/app/api/orders/actions';

export const getItems = cache(async () => {
	const items = await prisma.item.findMany({
		include: {
			categories: {
				include: {
					category: true
				}
			}
		},
		orderBy: {
			name: 'asc'
		}
	});

	return items.map(item => ({
		...item,
		price: Number(item.price),
		weight: item.weight ? Number(item.weight) : null,
		categories: item.categories.map(cat => ({
			...cat,
			category: {
				...cat.category,
				id: cat.category.id,
				name: cat.category.name,
				color: cat.category.color
			}
		}))
	})) as Item[];
});

export const getCategories = cache(async () => {
	const categories = await prisma.category.findMany({
		orderBy: [{ order: 'asc' }, { name: 'asc' }]
	});

	return categories.map(category => ({
		...category,
		color: category.color || '#000000', // Default color if not set
		order: category.order || 0 // Default order if not set
	})) as Category[];
});


interface CreateOrderFormData {
	customerName: string;
	customMessage?: string;
	orderItems: Array<{
		itemId: string;
		quantity: number;
		price: number;
	}>;
}

export async function createOrderAction(formData: CreateOrderFormData) {
	try {
		const order = await createOrder({
			customerName: formData.customerName,
			customMessage: formData.customMessage,
			items: formData.orderItems
		});

		revalidatePath('/orders');
		return { success: true, order };
	} catch (error) {
		console.error('Error creating order:', error);
		return { success: false, error: error instanceof Error ? error.message : 'Failed to create order' };
	}
}

