import ItemsClient from '@/components/items/items-client';
import { getCategorizedItems } from '../api/items/route';
import { getUncategorizedItems } from '../api/items/uncategorized/route';
import { cache } from 'react';

const getCachedUncategorizedItems = cache(
	async (page: number, limit: number) => {
		return await getUncategorizedItems(page, limit);
	}
);

const getCachedCategorizedItems = cache(async () => {
	return await getCategorizedItems();
});

interface PageProps {
	searchParams: Promise<{
		page?: string;
		limit?: string;
	}>;
}

export default async function ItemsPage({ searchParams }: PageProps) {
	const resolvedSearchParams = await searchParams;
	const page = parseInt(resolvedSearchParams.page || '1');
	const limit = parseInt(resolvedSearchParams.limit || '20');

	const { items: uncategorizedItems, pagination } =
		await getCachedUncategorizedItems(page, limit);
	const categories = await getCachedCategorizedItems();

	return (
		<ItemsClient
			pagination={pagination}
			initialItems={uncategorizedItems}
			initialCategories={categories}
		/>
	);
}
