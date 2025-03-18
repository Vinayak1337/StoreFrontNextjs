import { NextRequest, NextResponse } from 'next/server';
import { sampleBills } from '@/lib/mocks/data';

// GET /api/bills/[id] - Get a specific bill
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = Number(params.id);
		const bill = sampleBills.find(bill => bill.id === id);

		if (!bill) {
			return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
		}

		return NextResponse.json(bill);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

// PUT /api/bills/[id] - Update a bill
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = Number(params.id);
		const updates = await request.json();

		const index = sampleBills.findIndex(bill => bill.id === id);
		if (index === -1) {
			return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
		}

		sampleBills[index] = { ...sampleBills[index], ...updates };
		return NextResponse.json(sampleBills[index]);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

// DELETE /api/bills/[id] - Delete a bill
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = Number(params.id);
		const index = sampleBills.findIndex(bill => bill.id === id);

		if (index === -1) {
			return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
		}

		sampleBills.splice(index, 1);
		return new NextResponse(null, { status: 204 });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
