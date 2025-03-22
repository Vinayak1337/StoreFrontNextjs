'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { fetchBills } from '@/lib/redux/slices/bills.slice';
import { fetchSettings } from '@/lib/redux/slices/settings.slice';
import { printBill } from '@/lib/utils/bill-utils';
import { ArrowLeft, Printer } from 'lucide-react';
import { toast } from 'react-toastify';

export default function BillDetailsPage() {
	const router = useRouter();
	const params = useParams();
	const billId = params.id as string;

	const dispatch = useDispatch<AppDispatch>();
	const { bills, loading, error } = useSelector(
		(state: RootState) => state.bills
	);
	const { settings } = useSelector((state: RootState) => state.settings);

	useEffect(() => {
		dispatch(fetchBills());
		dispatch(fetchSettings());
	}, [dispatch]);

	const bill = bills.find(b => b.id === billId);

	const handlePrint = () => {
		if (!settings) {
			toast.error('Store settings not loaded. Please try again later.');
			return;
		}

		if (!bill) {
			toast.error('Bill not found');
			return;
		}

		printBill(bill, settings);
	};

	if (loading) {
		return (
			<div className='container py-8'>
				<div className='flex justify-center items-center h-64'>
					<div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='container py-8'>
				<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
					<p>Error: {error}</p>
				</div>
			</div>
		);
	}

	if (!bill) {
		return (
			<div className='container py-8'>
				<div className='bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md'>
					<p>Bill not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className='container py-8'>
			<div className='flex items-center gap-4 mb-6'>
				<Button
					variant='outline'
					size='icon'
					onClick={() => router.push('/bills')}
					className='h-9 w-9'>
					<ArrowLeft className='h-4 w-4' />
				</Button>
				<h1 className='text-2xl font-bold'>Bill Details</h1>

				<div className='ml-auto'>
					<Button onClick={handlePrint} className='flex items-center gap-2'>
						<Printer className='h-4 w-4' />
						Print Bill
					</Button>
				</div>
			</div>

			<div className='grid md:grid-cols-2 gap-6'>
				<Card>
					<CardHeader>
						<CardTitle>Bill Information</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid grid-cols-2 gap-2'>
							<span className='text-muted-foreground'>Bill ID:</span>
							<span className='font-medium'>{bill.id}</span>

							<span className='text-muted-foreground'>Order ID:</span>
							<span className='font-medium'>{bill.orderId}</span>

							<span className='text-muted-foreground'>Date:</span>
							<span className='font-medium'>
								{bill.createdAt
									? format(new Date(bill.createdAt), 'PPP')
									: 'N/A'}
							</span>

							<span className='text-muted-foreground'>Payment Method:</span>
							<span className='font-medium'>{bill.paymentMethod}</span>

							<span className='text-muted-foreground'>Payment Status:</span>
							<span className='font-medium'>
								{bill.isPaid ? 'Paid' : 'Unpaid'}
							</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Amount Details</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid grid-cols-2 gap-2'>
							<span className='text-muted-foreground'>Subtotal:</span>
							<span className='font-medium'>
								{settings?.currency || '₹'}{' '}
								{Number(bill.totalAmount).toFixed(2)}
							</span>

							<span className='text-muted-foreground font-bold'>
								Total Amount:
							</span>
							<span className='font-bold'>
								{settings?.currency || '₹'}{' '}
								{Number(bill.totalAmount).toFixed(2)}
							</span>
						</div>
					</CardContent>
				</Card>
			</div>

			{bill.order && (
				<Card className='mt-6'>
					<CardHeader>
						<CardTitle>Order Items</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='border rounded-md overflow-hidden'>
							<table className='w-full'>
								<thead className='bg-muted'>
									<tr>
										<th className='text-left p-3'>Item</th>
										<th className='text-right p-3'>Quantity</th>
										<th className='text-right p-3'>Price</th>
										<th className='text-right p-3'>Total</th>
									</tr>
								</thead>
								<tbody>
									{bill.order.orderItems?.map(item => (
										<tr key={item.id} className='border-t'>
											<td className='p-3'>
												{item.item?.name ||
													`Item #${item.itemId.substring(0, 6)}`}
											</td>
											<td className='p-3 text-right'>{item.quantity}</td>
											<td className='p-3 text-right'>
												{settings?.currency || '₹'}{' '}
												{Number(item.price).toFixed(2)}
											</td>
											<td className='p-3 text-right'>
												{settings?.currency || '₹'}{' '}
												{(Number(item.price) * item.quantity).toFixed(2)}
											</td>
										</tr>
									))}
									<tr className='border-t bg-muted/50'>
										<td colSpan={3} className='p-3 text-right font-medium'>
											Total:
										</td>
										<td className='p-3 text-right font-bold'>
											{settings?.currency || '₹'}{' '}
											{Number(bill.totalAmount).toFixed(2)}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			)}

			<div className='mt-6 flex justify-between'>
				<Button variant='outline' onClick={() => router.push('/bills')}>
					Back to Bills
				</Button>
			</div>
		</div>
	);
}
