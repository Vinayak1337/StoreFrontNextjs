import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '50');
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

		const uncategorizedItems = items.map(item => ({
			...item,
			price: item.price.toNumber(),
			weight: item.weight?.toNumber()
		}));

		return NextResponse.json({
			items: uncategorizedItems,
			pagination: {
				page,
				limit,
				total: totalCount
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
