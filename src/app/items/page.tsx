import ItemsClient from '@/components/items/items-client';
import { getCategorizedItems, getUncategorizedItems } from '../api/items/actions';
import { cache } from 'react';

// Global type declarations from index.d.ts
declare global {
	interface Item {
		id: string;
		name: string;
		price: number;
		quantity: number;
		inStock: boolean;
		weight?: number;
		weightUnit: string | null;
		createdAt: Date;
		categories?: ItemCategory[];
	}

	interface Category {
		id: string;
		name: string;
		color: string;
		order: number;
		createdAt: Date;
		items?: ItemCategory[];
		_count?: {
			items: number;
		};
	}

	interface ItemCategory {
		id: string;
		itemId: string;
		categoryId: string;
		createdAt: Date;
		item?: Item;
		category?: Category;
	}
}

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
			initialItems={uncategorizedItems as unknown as Item[]}
			initialCategories={categories as unknown as Category[]}
		/>
	);
}
