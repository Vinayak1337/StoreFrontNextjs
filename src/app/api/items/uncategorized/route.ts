import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/items/uncategorized - Get items that are not in any category with pagination
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '50');
		const skip = (page - 1) * limit;

		// Get items that don't have any category relationships
		const [uncategorizedItems, totalCount] = await prisma.$transaction([
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

		return NextResponse.json({
			items: uncategorizedItems,
			pagination: {
				page,
				limit,
				total: totalCount,
				totalPages: Math.ceil(totalCount / limit),
				hasNext: page * limit < totalCount,
				hasPrev: page > 1
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