import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/items - Get all items with optional pagination
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '100');

		const skip = (page - 1) * limit;
		const shouldPaginate = page > 0 && limit > 0;

		const [items, totalCount] = await prisma.$transaction([
			prisma.item.findMany({
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
									color: true,
									createdAt: true,
									order: true
								}
							}
						}
					}
				}
			}),
			prisma.item.count()
		]);

		const processedItems = items.map(item => ({
			...item,
			price: item.price.toNumber(),
			weight: item.weight?.toNumber()
		}));

		const paginationResult = shouldPaginate
			? {
					page,
					limit,
					total: totalCount
			  }
			: undefined;

		return NextResponse.json({ items: processedItems, pagination: paginationResult });
	} catch (error) {
		console.error('Error fetching items:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch items' },
			{ status: 500 }
		);
	}
}


// POST /api/items - Create a new item
export async function POST(request: NextRequest) {
	try {
		// CSRF is now handled by middleware
		const body = await request.json();

		const { name, price, weight, weightUnit, quantity, inStock, metadata } =
			body;

		if (!name || !price) {
			return NextResponse.json(
				{ error: 'Name and price are required' },
				{ status: 400 }
			);
		}

		// Convert string values to appropriate types
		const itemData = {
			name,
			price: typeof price === 'string' ? parseFloat(price) : price,
			weight: weight
				? typeof weight === 'string'
					? parseFloat(weight)
					: weight
				: undefined,
			weightUnit: weight ? weightUnit : undefined,
			quantity: quantity
				? typeof quantity === 'string'
					? parseInt(quantity, 10)
					: quantity
				: 1,
			inStock: inStock !== undefined ? inStock : true,
			metadata: metadata || {}
		};

		const item = await prisma.item.create({
			data: itemData
		});

		return NextResponse.json(item, { status: 201 });
	} catch (error) {
		console.error('Error creating item:', error);
		return NextResponse.json(
			{ error: 'Failed to create item' },
			{ status: 500 }
		);
	}
}
