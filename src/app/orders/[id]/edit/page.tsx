import { notFound, redirect } from 'next/navigation';
import { getOrderById, updateOrderWithItems } from '@/app/api/orders/actions';
import { getItems, getCategories } from '@/app/api/orders/create/actions';
import { EditOrderClient } from '@/components/orders/edit/edit-order-client';

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function EditOrderPage({ params }: PageProps) {
	const { id } = await params;
	const order = await getOrderById(id);
	const [allItems, categories] = await Promise.all([
		getItems(),
		getCategories()
	]);
	if (!order) return notFound();
	const baseCustomerName = order.customerName;
	const baseCustomMessage = order.customMessage || undefined;

	async function updateAction(formData: FormData) {
		'use server';
		const customerName = String(formData.get('customerName') || '').trim();
		const customMessage = String(formData.get('customMessage') || '').trim();
		// Parse items from form (fields: itemId[], quantity[], price[])
		const itemIds = formData.getAll('itemId') as string[];
		const quantities = formData.getAll('quantity') as string[];
		const prices = formData.getAll('price') as string[];
		const items = itemIds
			.map((itemId, idx) => ({
				itemId,
				quantity: Number(quantities[idx] || 0),
				price: Number(prices[idx] || 0)
			}))
			.filter(i => i.itemId && i.quantity > 0 && i.price > 0);

		await updateOrderWithItems(id, {
			customerName: customerName || baseCustomerName,
			customMessage: customMessage || baseCustomMessage,
			items
		});
		redirect(`/orders/${id}`);
	}

	return (
		<div className='container py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6'>
			<EditOrderClient order={order} items={allItems} categories={categories} />
		</div>
	);
}
