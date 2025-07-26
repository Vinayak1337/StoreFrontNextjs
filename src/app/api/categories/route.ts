import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Category } from '@prisma/client';

export function getCategories(): Promise<Category[]> {
	return prisma.category.findMany({
		include: {
			_count: {
				select: { items: true }
			}
		},
		orderBy: [{ order: 'asc' }, { name: 'asc' }]
	});
}

export async function GET() {
	try {
		const categories = await getCategories();

		return NextResponse.json(categories);
	} catch (error) {
		console.error('Error fetching categories:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

// POST /api/categories - Create a new category
export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { name, color = '#6B7280', order = 0 } = body;

		if (!name) {
			return NextResponse.json(
				{ error: 'Category name is required' },
				{ status: 400 }
			);
		}

		// Check if category with same name already exists
		const existingCategory = await prisma.category.findUnique({
			where: { name }
		});

		if (existingCategory) {
			return NextResponse.json(
				{ error: 'Category with this name already exists' },
				{ status: 409 }
			);
		}

		const category = await prisma.category.create({
			data: {
				name,
				color,
				order
			},
			include: {
				_count: {
					select: { items: true }
				}
			}
		});

		return NextResponse.json(category, { status: 201 });
	} catch (error) {
		console.error('Error creating category:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
