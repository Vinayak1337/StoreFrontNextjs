import { NextRequest, NextResponse } from 'next/server';
import { unarchiveOrder } from '../../actions';

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const result = await unarchiveOrder(id);
		return NextResponse.json(result);
	} catch (error) {
		console.error('Error unarchiving order:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Failed to unarchive order' },
			{ status: 500 }
		);
	}
}