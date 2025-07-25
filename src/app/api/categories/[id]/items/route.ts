import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/categories/[id]/items - Get items in a specific category with pagination
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: categoryId } = await params;
		const { searchParams } = new URL(req.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '50');
		const skip = (page - 1) * limit;

		// Check if category exists
		const category = await prisma.category.findUnique({
			where: { id: categoryId }
		});

		if (!category) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 });
		}

		// Get items in this category with pagination
		const [itemCategories, totalCount] = await prisma.$transaction([
			prisma.itemCategory.findMany({
				where: { categoryId },
				skip,
				take: limit,
				include: {
					item: true
				},
				orderBy: {
					item: {
						createdAt: 'desc'
					}
				}
			}),
			prisma.itemCategory.count({
				where: { categoryId }
			})
		]);

		const items = itemCategories.map(ic => ic.item);

		return NextResponse.json({
			items,
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
		console.error('Error fetching category items:', error);
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

// POST /api/categories/[id]/items - Add item to category
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: categoryId } = await params;
		const body = await req.json();
		const { itemId } = body;

		if (!itemId) {
			return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
		}

		// Check if category exists
		const category = await prisma.category.findUnique({
			where: { id: categoryId }
		});

		if (!category) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 });
		}

		// Check if item exists
		const item = await prisma.item.findUnique({
			where: { id: itemId }
		});

		if (!item) {
			return NextResponse.json({ error: 'Item not found' }, { status: 404 });
		}

		// Check if relationship already exists
		const existingRelation = await prisma.itemCategory.findFirst({
			where: {
				itemId,
				categoryId
			}
		});

		if (existingRelation) {
			return NextResponse.json({ error: 'Item is already in this category' }, { status: 409 });
		}

		// Create the relationship
		const itemCategory = await prisma.itemCategory.create({
			data: {
				itemId,
				categoryId
			},
			include: {
				item: true,
				category: true
			}
		});

		return NextResponse.json(itemCategory, { status: 201 });
	} catch (error) {
		console.error('Error adding item to category:', error);
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

// DELETE /api/categories/[id]/items - Remove item from category
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: categoryId } = await params;
		const { searchParams } = new URL(req.url);
		const itemId = searchParams.get('itemId');

		console.log('DELETE /api/categories/[id]/items called with:', { categoryId, itemId });

		if (!itemId) {
			console.log('Missing itemId in request');
			return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
		}

		// Validate UUIDs
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (!uuidRegex.test(categoryId) || !uuidRegex.test(itemId)) {
			console.log('Invalid UUID format:', { categoryId, itemId });
			return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
		}

		// Find and delete the relationship
		console.log('Looking for relationship between item and category...');
		const relation = await prisma.itemCategory.findFirst({
			where: {
				itemId,
				categoryId
			}
		});

		console.log('Found relation:', relation);

		if (!relation) {
			console.log('Relation not found, item is not in this category');
			return NextResponse.json({ error: 'Item is not in this category' }, { status: 404 });
		}

		console.log('Deleting relation with ID:', relation.id);
		await prisma.itemCategory.delete({
			where: { id: relation.id }
		});

		console.log('Successfully removed item from category');
		return NextResponse.json({ message: 'Item removed from category successfully' });
	} catch (error) {
		console.error('Error removing item from category:', error);
		console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}