'use server';

import { redirect } from 'next/navigation';
import { deleteOrder, archiveOrder, unarchiveOrder } from '../actions';

export async function handleDeleteOrder(orderId: string) {
	try {
		await deleteOrder(orderId);
		redirect('/orders');
	} catch (error) {
		throw error;
	}
}

export async function handleArchiveOrder(orderId: string) {
	try {
		await archiveOrder(orderId);
		redirect('/orders');
	} catch (error) {
		throw error;
	}
}

export async function handleUnarchiveOrder(orderId: string) {
	try {
		await unarchiveOrder(orderId);
		redirect('/orders/archived');
	} catch (error) {
		throw error;
	}
}
