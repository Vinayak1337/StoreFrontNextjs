'use server';

import { cache } from 'react';
import prisma from '@/lib/prisma';
import { JsonValue } from '@prisma/client/runtime/library';

interface ItemCategory {
	id: string;
	itemId: string;
	categoryId: string;
	createdAt: Date;
	item?: ProcessedItem;
	category?: Category;
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

interface Pagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

interface ProcessedItem {
	id: string;
	name: string;
	price: number;
	weight?: number;
	weightUnit: string | null;
	quantity: number;
	inStock: boolean;
	metadata: JsonValue;
	createdAt: Date;
	categories: Array<{
		id: string;
		name: string;
		color: string;
	}>;
}

interface CategorizedItemsResponse {
	id: string;
	name: string;
	color: string;
	order: number;
	createdAt: Date;
	items: unknown[];
}

export const getItems = cache(async (
	page: number,
	limit: number
): Promise<{
	items: ProcessedItem[];
	pagination?: Pagination;
}> => {
	const skip = (page - 1) * limit;

	// if false, return all items without pagination
	const shouldPaginate = page > 0 && limit > 0;

	const items = await prisma.item.findMany({
		skip: shouldPaginate ? skip : undefined,
		take: shouldPaginate ? limit : undefined,
		orderBy: {
			createdAt: 'desc'
		},
		include: {
			categories: {
				select: {
					categoryId: true,
					createdAt: true,
					id: true,
					itemId: true,
					category: {
						select: {
							id: true,
							name: true,
							color: true
						}
					}
				}
			}
		}
	});

	const totalCount = shouldPaginate ? await prisma.item.count() : 0;

	const processedItems = items.map(item => ({
		...item,
		weight: item.weight ? Number(item.weight) : undefined,
		price: Number(item.price),
		categories: item.categories.map(cat => cat.category)
	}));

	if (!shouldPaginate) {
		return { items: processedItems };
	}

	const totalPages = Math.ceil(totalCount / limit);
	const hasNext = page < totalPages;
	const hasPrev = page > 1;

	return {
		items: processedItems,
		pagination: {
			page,
			limit,
			total: totalCount,
			totalPages,
			hasNext,
			hasPrev
		}
	} as {
		items: ProcessedItem[];
		pagination: Pagination;
	};
});

export const getCategorizedItems = cache(async (): Promise<CategorizedItemsResponse[]> => {
	return prisma.category.findMany({
		include: {
			items: {
				include: {
					item: {
						include: {
							categories: {
								include: {
									category: true
								}
							}
						}
					}
				}
			}
		},
		orderBy: [{ order: 'asc' }, { name: 'asc' }]
	}) as Promise<CategorizedItemsResponse[]>;
});

export const getUncategorizedItems = cache(async (
	page: number,
	limit: number
): Promise<{
	items: ProcessedItem[];
	pagination: Pagination;
}> => {
	const skip = (page - 1) * limit;

	const items = await prisma.item.findMany({
		where: {
			categories: {
				none: {}
			}
		},
		skip,
		take: limit,
		orderBy: {
			createdAt: 'desc'
		}
	});

	const totalCount = await prisma.item.count({
		where: {
			categories: {
				none: {}
			}
		}
	});

	const processedItems = items.map(item => ({
		...item,
		weight: item.weight ? Number(item.weight) : undefined,
		price: Number(item.price),
		categories: []
	}));

	const totalPages = Math.ceil(totalCount / limit);
	const hasNext = page < totalPages;
	const hasPrev = page > 1;

	return {
		items: processedItems,
		pagination: {
			page,
			limit,
			total: totalCount,
			totalPages,
			hasNext,
			hasPrev
		}
	};
});