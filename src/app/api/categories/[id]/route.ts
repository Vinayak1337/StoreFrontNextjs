import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/categories/[id] - Get single category with items
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;

		const category = await prisma.category.findUnique({
			where: { id },
			include: {
				items: {
					include: {
						item: true
					}
				},
				_count: {
					select: { items: true }
				}
			}
		});

		if (!category) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 });
		}

		return NextResponse.json(category);
	} catch (error) {
		console.error('Error fetching category:', error);
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

// PUT /api/categories/[id] - Update category
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const body = await req.json();
		const { name, color, order } = body;

		// Check if category exists
		const existingCategory = await prisma.category.findUnique({
			where: { id }
		});

		if (!existingCategory) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 });
		}

		// Check if name is unique (excluding current category)
		if (name && name !== existingCategory.name) {
			const nameExists = await prisma.category.findUnique({
				where: { name }
			});

			if (nameExists) {
				return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
			}
		}

		const updatedCategory = await prisma.category.update({
			where: { id },
			data: {
				...(name && { name }),
				...(color && { color }),
				...(order !== undefined && { order })
			},
			include: {
				_count: {
					select: { items: true }
				}
			}
		});

		return NextResponse.json(updatedCategory);
	} catch (error) {
		console.error('Error updating category:', error);
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;

		// Check if category exists
		const existingCategory = await prisma.category.findUnique({
			where: { id },
			include: {
				_count: {
					select: { items: true }
				}
			}
		});

		if (!existingCategory) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 });
		}

		// Check if category has items
		if (existingCategory._count.items > 0) {
			return NextResponse.json({ 
				error: 'Cannot delete category with items. Please remove all items from this category first.' 
			}, { status: 400 });
		}

		await prisma.category.delete({
			where: { id }
		});

		return NextResponse.json({ message: 'Category deleted successfully' });
	} catch (error) {
		console.error('Error deleting category:', error);
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}