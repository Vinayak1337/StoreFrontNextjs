import { NextRequest, NextResponse } from 'next/server';
import { archiveOrder } from '../../actions';

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const result = await archiveOrder(id);
		return NextResponse.json(result);
	} catch (error) {
		console.error('Error archiving order:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Failed to archive order' },
			{ status: 500 }
		);
	}
}