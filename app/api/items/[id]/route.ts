import { NextRequest, NextResponse } from 'next/server';
import { sampleItems } from '@/lib/mocks/data';

// GET /api/items/[id] - Get a specific item
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = Number(params.id);
		const item = sampleItems.find(item => item.id === id);

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
	{ params }: { params: { id: string } }
) {
	try {
		const id = Number(params.id);
		const updates = await request.json();

		const index = sampleItems.findIndex(item => item.id === id);
		if (index === -1) {
			return NextResponse.json({ error: 'Item not found' }, { status: 404 });
		}

		sampleItems[index] = { ...sampleItems[index], ...updates };
		return NextResponse.json(sampleItems[index]);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

// DELETE /api/items/[id] - Delete a specific item
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = Number(params.id);
		const index = sampleItems.findIndex(item => item.id === id);

		if (index === -1) {
			return NextResponse.json({ error: 'Item not found' }, { status: 404 });
		}

		sampleItems.splice(index, 1);
		return new NextResponse(null, { status: 204 });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
