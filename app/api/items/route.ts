import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/items - Get all items
export async function GET() {
	try {
		const items = await prisma.item.findMany({
			orderBy: {
				createdAt: 'desc'
			}
		});

		return NextResponse.json(items);
	} catch (error) {
		console.error('Error fetching items:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch items' },
			{ status: 500 }
		);
	}
}

// POST /api/items - Create a new item
export async function POST(request: Request) {
	try {
		const body = await request.json();

		const { name, price, weight, quantity, metadata } = body;

		if (!name || !price) {
			return NextResponse.json(
				{ error: 'Name and price are required' },
				{ status: 400 }
			);
		}

		const item = await prisma.item.create({
			data: {
				name,
				price,
				weight,
				quantity: quantity || 1,
				metadata: metadata || {}
			}
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
