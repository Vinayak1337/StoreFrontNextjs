import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/bills/[id] - Get a specific bill
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		const bill = await prisma.bill.findUnique({
			where: { id },
			include: {
				order: {
					include: {
						orderItems: {
							include: {
								item: true
							}
						}
					}
				}
			}
		});

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
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const updates = await request.json();

		const bill = await prisma.bill.findUnique({
			where: { id }
		});

		if (!bill) {
			return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
		}

		const updatedBill = await prisma.bill.update({
			where: { id },
			data: updates,
			include: {
				order: {
					include: {
						orderItems: {
							include: {
								item: true
							}
						}
					}
				}
			}
		});

		return NextResponse.json(updatedBill);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

// DELETE /api/bills/[id] - Delete a bill
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		const bill = await prisma.bill.findUnique({
			where: { id }
		});

		if (!bill) {
			return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
		}

		await prisma.bill.delete({
			where: { id }
		});

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
