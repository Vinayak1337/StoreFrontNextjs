'use server';

import { revalidatePath } from 'next/cache';
import { updateOrderWithItems } from '@/app/api/orders/actions';

interface UpdateOrderFormData {
	id: string;
	customerName?: string;
	customMessage?: string;
	orderItems: Array<{
		itemId: string;
		quantity: number;
		price: number;
	}>;
}

export async function updateOrderAction(formData: UpdateOrderFormData) {
	try {
		const order = await updateOrderWithItems(formData.id, {
			customerName: formData.customerName,
			customMessage: formData.customMessage,
			items: formData.orderItems
		});
		revalidatePath('/orders');
		revalidatePath(`/orders/${formData.id}`);
		return { success: true, order };
	} catch (error) {
		console.error('Error updating order:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update order'
		};
	}
}
