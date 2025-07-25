import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/bills - Get all bills
export async function GET() {
	try {
		const bills = await prisma.bill.findMany({
			take: 100, // Limit to 100 most recent bills
			include: {
				order: {
					select: {
						id: true,
						customerName: true,
						customMessage: true,
						orderItems: {
							select: {
								id: true,
								quantity: true,
								price: true,
								item: {
									select: { id: true, name: true, price: true }
								}
							},
							orderBy: {
								id: 'desc'
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
	} catch {
		return NextResponse.json(
			{ error: 'Failed to fetch bills' },
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
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

		// Optimized: Check order existence and existing bill in one transaction
		const result = await prisma.$transaction(async (tx) => {
			// Check if order exists and no bill exists
			const order = await tx.order.findUnique({
				where: { id: orderId },
				select: { id: true }
			});

			if (!order) {
				throw new Error('Order not found');
			}

			const existingBill = await tx.bill.findUnique({
				where: { orderId },
				select: { id: true }
			});

			if (existingBill) {
				throw new Error('A bill already exists for this order');
			}

			// Create the bill with minimal includes
			return await tx.bill.create({
				data: {
					totalAmount,
					taxes: taxes || 0,
					paymentMethod,
					orderId // Direct foreign key instead of connect
				},
				include: {
					order: {
						select: {
							id: true,
							customerName: true,
							orderItems: {
								select: {
									id: true,
									quantity: true,
									price: true,
									item: {
										select: { id: true, name: true }
									}
								}
							}
						}
					}
				}
			});
		}, {
			timeout: 5000, // 5 second timeout for Vercel
			maxWait: 2000
		});

		return NextResponse.json(result, { status: 201 });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to create bill';
		return NextResponse.json(
			{ error: errorMessage },
			{ status: errorMessage.includes('not found') ? 404 : errorMessage.includes('already exists') ? 400 : 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}

// DELETE /api/bills/:id - Delete a bill
export async function DELETE(request: Request) {
	try {
		const url = new URL(request.url);
		const id = url.pathname.split('/').pop() as string;

		// Optimized: Check existence and delete in one transaction
		await prisma.$transaction(async (tx) => {
			const bill = await tx.bill.findUnique({
				where: { id },
				select: { id: true }
			});

			if (!bill) {
				throw new Error('Bill not found');
			}

			await tx.bill.delete({
				where: { id }
			});
		});

		return NextResponse.json({
			success: true,
			message: 'Bill deleted successfully'
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to delete bill';
		return NextResponse.json(
			{ error: errorMessage },
			{ status: errorMessage.includes('not found') ? 404 : 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
