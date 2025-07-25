import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/bills - Get all bills
export async function GET() {
	try {
		const bills = await prisma.bill.findMany({
			include: {
				order: {
					include: {
						orderItems: {
							include: {
								item: true
							},
							orderBy: {
								id: 'desc' // Sort by ID descending as proxy for creation date
							}
						}
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		return NextResponse.json(bills);
	} catch (error) {
		console.error('Error fetching bills:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch bills' },
			{ status: 500 }
		);
	}
}

// POST /api/bills - Create a new bill
export async function POST(request: Request) {
	try {
		const body = await request.json();

		const { orderId, totalAmount, taxes, paymentMethod } = body;

		if (!orderId || !totalAmount || !paymentMethod) {
			return NextResponse.json(
				{ error: 'Order ID, total amount, and payment method are required' },
				{ status: 400 }
			);
		}

		// Check if the order exists
		const order = await prisma.order.findUnique({
			where: { id: orderId }
		});

		if (!order) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}

		// Since we removed status, all orders are valid for billing

		// Check if a bill already exists for this order (including soft-deleted bills)
		const existingBill = await prisma.bill.findUnique({
			where: { orderId }
		});

		if (existingBill) {
			return NextResponse.json(
				{ error: 'A bill already exists for this order' },
				{ status: 400 }
			);
		}

		// Create the bill
		const bill = await prisma.bill.create({
			data: {
				totalAmount,
				taxes: taxes || 0,
				paymentMethod,
				order: {
					connect: {
						id: orderId
					}
				}
			},
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

		return NextResponse.json(bill, { status: 201 });
	} catch (error) {
		console.error('Error creating bill:', error);
		return NextResponse.json(
			{ error: 'Failed to create bill' },
			{ status: 500 }
		);
	}
}

// DELETE /api/bills/:id - Delete a bill
export async function DELETE(request: Request) {
	try {
		const url = new URL(request.url);
		const id = url.pathname.split('/').pop() as string;

		// Check if the bill exists
		const bill = await prisma.bill.findUnique({
			where: { id }
		});

		if (!bill) {
			return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
		}

		// Delete the bill
		await prisma.bill.delete({
			where: { id }
		});

		return NextResponse.json({
			success: true,
			message: 'Bill deleted successfully'
		});
	} catch (error) {
		console.error('Error deleting bill:', error);
		return NextResponse.json(
			{ error: 'Failed to delete bill' },
			{ status: 500 }
		);
	}
}
