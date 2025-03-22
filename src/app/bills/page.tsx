'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreateBillDialog } from '@/components/bills/create-bill-dialog';
import { fetchBills, deleteBill } from '@/lib/redux/slices/bills.slice';
import { fetchSettings } from '@/lib/redux/slices/settings.slice';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { printBill } from '@/lib/utils/bill-utils';
import { toast } from 'react-toastify';
import { Trash, Eye, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BillsPage() {
	const dispatch = useDispatch<AppDispatch>();
	const router = useRouter();
	const { bills, loading, error } = useSelector(
		(state: RootState) => state.bills
	);
	const { settings } = useSelector((state: RootState) => state.settings);

	useEffect(() => {
		dispatch(fetchBills());
		dispatch(fetchSettings());
	}, [dispatch]);

	// Calculate the number of unpaid bills
	const unpaidBillsCount = bills.filter(bill => !bill.isPaid).length;

	const handlePrintBill = (billId: string) => {
		if (!settings) {
			toast.error('Store settings not loaded. Please try again later.');
			return;
		}

		const bill = bills.find(b => b.id === billId);
		if (!bill) {
			toast.error('Bill not found');
			return;
		}

		// Show a notification that print is being prepared
		toast.info('Preparing bill for printing...', { autoClose: 2000 });

		// Detect Samsung browser for customized message
		const isSamsungBrowser = /SamsungBrowser/i.test(navigator.userAgent);
		if (isSamsungBrowser) {
			// Show Samsung-specific instructions after a short delay
			setTimeout(() => {
				toast.info(
					"Samsung tablet detected. If print doesn't appear, check your notification panel for print options.",
					{ autoClose: 5000 }
				);
			}, 2500);
		}

		try {
			printBill(bill, settings);
		} catch (error) {
			console.error('Print error:', error);
			toast.error('There was an error printing the bill. Please try again.');
		}
	};

	const handleDeleteBill = (billId: string) => {
		if (
			confirm(
				'Are you sure you want to delete this bill? This action cannot be undone.'
			)
		) {
			dispatch(deleteBill(billId));
		}
	};

	const handleViewDetails = (billId: string) => {
		router.push(`/bills/${billId}`);
	};

	return (
		<div className='flex flex-col min-h-screen'>
			<header className='sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6'>
				<div className='flex flex-1 items-center justify-between'>
					<h1 className='text-xl font-semibold'>Bills Management</h1>
					<div className='flex items-center gap-3'>
						<Button
							variant='ghost'
							size='icon'
							className='rounded-full hover:bg-accent/50 relative'>
							<Bell className='h-5 w-5' />
							{unpaidBillsCount > 0 && (
								<span className='absolute top-0 right-0 h-2 w-2 bg-primary rounded-full animate-pulse'></span>
							)}
							<span className='sr-only'>Notifications</span>
						</Button>
						<CreateBillDialog />
					</div>
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
												{settings?.currency || '₹'}{' '}
												{(
													Number(bill.totalAmount) - Number(bill.taxes || 0)
												).toFixed(2)}
											</span>
										</div>
										<div className='flex items-center justify-between text-sm'>
											<span className='text-muted-foreground'>Tax:</span>
											<span>
												{settings?.currency || '₹'}{' '}
												{Number(bill.taxes || 0).toFixed(2)}
											</span>
										</div>
										<div className='flex items-center justify-between font-medium mt-1'>
											<span>Total:</span>
											<span>
												{settings?.currency || '₹'}{' '}
												{Number(bill.totalAmount).toFixed(2)}
											</span>
										</div>
										<div className='flex justify-between gap-2 mt-4'>
											<Button
												variant='ghost'
												size='sm'
												className='text-red-500 hover:text-red-700 hover:bg-red-50'
												onClick={() => handleDeleteBill(bill.id)}>
												<Trash className='h-4 w-4 mr-1' />
												Delete
											</Button>
											<div className='flex gap-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleViewDetails(bill.id)}>
													<Eye className='h-4 w-4 mr-1' />
													View Details
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handlePrintBill(bill.id)}>
													Print
												</Button>
											</div>
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
