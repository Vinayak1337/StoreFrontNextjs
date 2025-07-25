'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreateBillDialog } from '@/components/bills/create-bill-dialog';
import {
	fetchBills,
	deleteBill,
	updateBill
} from '@/lib/redux/slices/bills.slice';
import { fetchSettings } from '@/lib/redux/slices/settings.slice';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { toast } from 'react-toastify';
import {
	Trash,
	Eye,
	Bell,
	Printer,
	Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { printDirectlyToThermalPrinter } from '@/lib/utils/direct-thermal-print';

export default function BillsPage() {
	const dispatch = useDispatch<AppDispatch>();
	const router = useRouter();
	const { bills, loading, error } = useSelector(
		(state: RootState) => state.bills
	);
	const { settings } = useSelector((state: RootState) => state.settings);

	const [isPrintingThermal, setIsPrintingThermal] = useState<string | null>(null);

	useEffect(() => {
		dispatch(fetchBills());
		dispatch(fetchSettings());
	}, [dispatch]);

	// Calculate the number of unpaid bills
	const unpaidBillsCount = bills.filter(bill => !bill.isPaid).length;

	const handleViewDetails = (billId: string) => {
		router.push(`/bills/${billId}`);
	};

	const handlePrintBill = async (billId: string) => {
		try {
			setIsPrintingThermal(billId);
			
			const bill = bills.find(b => b.id === billId);
			if (!bill) {
				toast.error('Bill not found');
				return;
			}

			if (!settings) {
				toast.error('Store settings not loaded. Please try again later.');
				return;
			}

			// Direct thermal print using stored printer
			await printDirectlyToThermalPrinter(bill, settings);
			
		} catch (error) {
			console.error('Error with thermal print:', error);
			toast.error('Failed to print bill. Please try again.');
		} finally {
			setIsPrintingThermal(null);
		}
	};


	// Toggle bill payment status
	const handleTogglePayment = (billId: string, currentStatus: boolean) => {
		try {
			dispatch(updateBill({ id: billId, isPaid: !currentStatus }));
			toast.success(`Bill marked as ${!currentStatus ? 'paid' : 'unpaid'}`);
		} catch (error) {
			console.error('Error updating bill payment status:', error);
			toast.error('Failed to update payment status');
		}
	};

	const handleDeleteBill = (billId: string) => {
		if (
			confirm(
				'Are you sure you want to delete this bill? This action cannot be undone.'
			)
		) {
			dispatch(deleteBill(billId));
			toast.success('Bill deleted successfully');
		}
	};

	return (
		<div>
			<main className='container py-4 md:py-8'>
				<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4'>
					<div>
						<h1 className='text-2xl font-bold'>Bills</h1>
						<p className='text-muted-foreground'>
							Manage and view customer bills
						</p>
					</div>
					<div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
						{unpaidBillsCount > 0 && (
							<Badge variant='destructive' className='flex items-center gap-1'>
								<Bell className='h-3 w-3' />
								{unpaidBillsCount} {unpaidBillsCount === 1 ? 'Bill' : 'Bills'}{' '}
								Pending Payment
							</Badge>
						)}
						<CreateBillDialog />
					</div>
				</div>

				<div className='space-y-6'>
					{loading && (
						<div className='flex justify-center items-center h-64'>
							<div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
						</div>
					)}

					{error && (
						<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
							<p>Error: {error}</p>
						</div>
					)}

					{!loading && !error && bills.length === 0 && (
						<div className='text-center p-8 border border-dashed rounded-lg'>
							<p className='text-muted-foreground mb-4'>No bills found</p>
							<CreateBillDialog />
						</div>
					)}

					<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
						{bills.map(bill => (
							<Card key={bill.id} className='overflow-hidden flex flex-col'>
								<CardContent className='p-0 flex-1'>
									<div className='p-4 sm:p-6'>
										<div className='flex flex-col gap-3 mb-4 bill-header'>
											<div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3'>
												<div className='flex-1 min-w-0'>
													<CardTitle className='mb-1 text-lg'>
														Bill #{bill.id.substring(0, 8)}
													</CardTitle>
													<p className='text-sm text-muted-foreground'>
														{bill.createdAt
															? format(new Date(bill.createdAt), 'PPP')
															: 'N/A'}
													</p>
												</div>
												<div className='flex items-center gap-2 flex-shrink-0'>
													<div className='flex items-center space-x-2 whitespace-nowrap switch-container'>
														<Switch
															id={`payment-status-${bill.id}`}
															checked={bill.isPaid === true}
															onCheckedChange={() =>
																handleTogglePayment(bill.id, bill.isPaid === true)
															}
															className='medium-device-switch'
														/>
														<span
															className='text-sm min-w-[50px] switch-label cursor-pointer select-none'
															onClick={() =>
																handleTogglePayment(bill.id, bill.isPaid === true)
															}>
															{bill.isPaid ? 'Paid' : 'Unpaid'}
														</span>
													</div>
												</div>
											</div>
										</div>

										<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
											<div className='min-w-0'>
												<span className='text-sm text-muted-foreground block'>
													Customer
												</span>
												<span className='font-medium block truncate'>
													{bill.order?.customerName || 'N/A'}
												</span>
											</div>
											<div className='min-w-0'>
												<span className='text-sm text-muted-foreground block'>
													Total Amount
												</span>
												<span className='font-medium block'>
													{settings?.currency || '₹'}{' '}
													{Number(bill.totalAmount).toFixed(2)}
												</span>
											</div>
										</div>

										<div className='flex flex-col gap-3 pt-4 border-t'>
											<div className='flex justify-between items-center'>
												<Button
													variant='outline'
													size='sm'
													className='text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700'
													onClick={() => handleDeleteBill(bill.id)}>
													<Trash className='h-4 w-4 mr-1' />
													Delete
												</Button>
											</div>
											<div className='flex flex-col sm:flex-row items-stretch gap-2 button-group'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleViewDetails(bill.id)}
													className='flex-1 responsive-button'>
													<Eye className='h-4 w-4 mr-1' />
													<span className='hidden sm:inline'>View Details</span>
													<span className='sm:hidden'>View</span>
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handlePrintBill(bill.id)}
													disabled={isPrintingThermal === bill.id}
													className='flex-1 responsive-button'>
													{isPrintingThermal === bill.id ? (
														<>
															<Loader2 className='h-4 w-4 mr-1 animate-spin' />
															<span className='hidden sm:inline'>Printing...</span>
															<span className='sm:hidden'>...</span>
														</>
													) : (
														<>
															<Printer className='h-4 w-4 mr-1' />
															Print
														</>
													)}
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
