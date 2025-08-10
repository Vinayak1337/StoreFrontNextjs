import { notFound } from 'next/navigation';
import { getOrderById } from '@/app/api/orders/actions';
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
	// Client component handles update via server action; no server action here

	return (
		<div className='container py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6'>
			<EditOrderClient order={order} items={allItems} categories={categories} />
		</div>
	);
}
