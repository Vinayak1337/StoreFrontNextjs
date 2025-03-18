import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/items/[id] - Get a specific item
export async function GET(
	request: NextRequest,
	context: { params: { id: string } }
) {
	try {
		const id = context.params.id;
		const item = await prisma.item.findUnique({
			where: { id }
		});

		if (!item) {
			return NextResponse.json({ error: 'Item not found' }, { status: 404 });
		}

		return NextResponse.json(item);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

// PUT /api/items/[id] - Update a specific item
export async function PUT(
	request: NextRequest,
	context: { params: { id: string } }
) {
	try {
		const id = context.params.id;
		const updates = await request.json();

		const item = await prisma.item.findUnique({
			where: { id }
		});

		if (!item) {
			return NextResponse.json({ error: 'Item not found' }, { status: 404 });
		}

		const updatedItem = await prisma.item.update({
			where: { id },
			data: updates
		});

		return NextResponse.json(updatedItem);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

// DELETE /api/items/[id] - Delete a specific item
export async function DELETE(
	request: NextRequest,
	context: { params: { id: string } }
) {
	try {
		const id = context.params.id;

		// Check if the item exists
		const item = await prisma.item.findUnique({
			where: { id }
		});

		if (!item) {
			return NextResponse.json({ error: 'Item not found' }, { status: 404 });
		}

		// Delete the item
		await prisma.item.delete({
			where: { id }
		});

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
