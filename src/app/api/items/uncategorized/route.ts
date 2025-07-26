import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function getUncategorizedItems(
	page: number,
	limit: number
): Promise<{
	items: Item[];
	pagination: {
		page: number;
		limit: number;
		total: number;
	};
}> {
	const skip = (page - 1) * limit;

	const [items, totalCount] = await prisma.$transaction([
		prisma.item.findMany({
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
		}),
		prisma.item.count({
			where: {
				categories: {
					none: {}
				}
			}
		})
	]);

	return {
		items: items.map(item => ({
			...item,
			price: item.price.toNumber(),
			weight: item.weight?.toNumber()
		})),
		pagination: {
			page,
			limit,
			total: totalCount
		}
	};
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '50');
		const {
			items: uncategorizedItems,
			pagination: { total }
		} = await getUncategorizedItems(page, limit);

		return NextResponse.json({
			items: uncategorizedItems,
			pagination: {
				page,
				limit,
				total
			}
		});
	} catch (error) {
		console.error('Error fetching uncategorized items:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch uncategorized items' },
			{ status: 500 }
		);
	}
}
