'use server';

import { redirect } from 'next/navigation';
import { deleteOrder } from '../actions';

export async function handleDeleteOrder(orderId: string) {
	try {
		await deleteOrder(orderId);
		redirect('/orders');
	} catch (error) {
		throw error;
	}
}
