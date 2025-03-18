'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreateBillDialog } from '@/components/bills/create-bill-dialog';
import { fetchBills } from '@/lib/redux/slices/bills.slice';
import { RootState } from '@/lib/redux/store';

export default function BillsPage() {
	const dispatch = useDispatch();
	const { bills, loading, error } = useSelector(
		(state: RootState) => state.bills
	);

	useEffect(() => {
		dispatch(fetchBills());
	}, [dispatch]);

	return (
		<div className='flex flex-col min-h-screen'>
			<header className='sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6'>
				<div className='flex flex-1 items-center justify-between'>
					<h1 className='text-xl font-semibold'>Bills Management</h1>
					<CreateBillDialog />
				</div>
			</header>
			<main className='flex-1 p-6'>
				<div className='space-y-6'>
					<h2 className='text-2xl font-bold tracking-tight'>Bills</h2>

					{loading && <p className='text-center py-4'>Loading bills...</p>}

					{error && (
						<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
							<p>Error: {error}</p>
						</div>
					)}

					{!loading && !error && bills.length === 0 && (
						<div className='border rounded-md p-8 text-center'>
							<p className='text-muted-foreground'>
								No bills found. Create a new bill to get started.
							</p>
						</div>
					)}

					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
						{bills.map(bill => (
							<Card key={bill.id}>
								<CardHeader className='pb-2'>
									<div className='flex items-center justify-between'>
										<CardTitle className='text-lg'>
											Bill #{bill.id.substring(0, 8)}
										</CardTitle>
										<Badge variant='outline' className='ml-2'>
											{bill.paymentMethod}
										</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div className='grid gap-2'>
										<div className='flex items-center justify-between text-sm'>
											<span className='text-muted-foreground'>Order ID:</span>
											<span>#{bill.orderId.substring(0, 8)}</span>
										</div>
										<div className='flex items-center justify-between text-sm'>
											<span className='text-muted-foreground'>Created At:</span>
											<span>
												{bill.createdAt
													? format(new Date(bill.createdAt), 'MMM dd, yyyy')
													: 'N/A'}
											</span>
										</div>
										<div className='flex items-center justify-between text-sm'>
											<span className='text-muted-foreground'>Subtotal:</span>
											<span>
												$
												{(
													Number(bill.totalAmount) - Number(bill.taxes)
												).toFixed(2)}
											</span>
										</div>
										<div className='flex items-center justify-between text-sm'>
											<span className='text-muted-foreground'>Tax:</span>
											<span>${Number(bill.taxes).toFixed(2)}</span>
										</div>
										<div className='flex items-center justify-between font-medium mt-1'>
											<span>Total:</span>
											<span>${Number(bill.totalAmount).toFixed(2)}</span>
										</div>
										<div className='flex justify-end gap-2 mt-4'>
											<Button variant='outline' size='sm'>
												View Details
											</Button>
											<Button variant='outline' size='sm'>
												Print
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}
