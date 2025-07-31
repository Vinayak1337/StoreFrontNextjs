import {
	getItems,
	getCategories
} from '@/app/api/orders/create/actions';
import { CreateOrderClient } from '@/components/orders/create/create-order-client';

export default async function CreateOrderPage() {
	const [items, categories] = await Promise.all([
		getItems(),
		getCategories()
	]);

	return (
		<div className='container py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6'>
			<CreateOrderClient
				items={items}
				categories={categories}
			/>
		</div>
	);
}
