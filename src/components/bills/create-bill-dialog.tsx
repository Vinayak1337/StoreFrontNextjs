'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger
} from '@/components/ui/dialog';
import { fetchOrders } from '@/lib/redux/slices/orders.slice';
import { createBill } from '@/lib/redux/slices/bills.slice';
import { RootState, AppDispatch } from '@/lib/redux/store';
import {
	CreditCard,
	Check,
	Plus,
	ShoppingCart,
	Receipt,
	X,
	ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreateBillDialog() {
	const dispatch = useDispatch<AppDispatch>();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [selectedOrderId, setSelectedOrderId] = useState('');
	const [paymentMethod, setPaymentMethod] = useState('Cash');
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Fetch orders when dialog opens
	useEffect(() => {
		if (open && orders.length === 0) {
			dispatch(fetchOrders());
		}
	}, [open, dispatch, orders.length]);

	// Filter all orders that don't have a bill yet
	const availableOrders = orders.filter(
		order => !order.bill
	);

	// Get selected order
	const selectedOrder = orders.find(order => order.id === selectedOrderId);

	// Calculate subtotal for selected order
	const calculateSubtotal = () => {
		if (!selectedOrder) return 0;

		return selectedOrder.orderItems.reduce(
			(sum: number, item: { price: unknown; quantity: number }) =>
				sum + Number(item.price) * item.quantity,
			0
		);
	};

	const subtotal = calculateSubtotal();
	const total = subtotal;

	// Reset form
	const resetForm = () => {
		setSelectedOrderId('');
		setPaymentMethod('Cash');
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		if (!selectedOrderId) return;

		try {
			const result = await dispatch(
				createBill({
					orderId: selectedOrderId,
					totalAmount: total,
					taxes: 0,
					paymentMethod
				})
			);

			resetForm();
			setOpen(false);

			// Navigate to the bill details page if creation was successful
			if (createBill.fulfilled.match(result)) {
				router.push(`/bills/${result.payload.id}`);
			}
		} catch (error) {
			console.error('Failed to create bill:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const getPaymentIcon = (method: string) => {
		switch (method) {
			case 'Credit Card':
			case 'Debit Card':
				return <CreditCard className='h-4 w-4' />;
			case 'Cash':
				return <Receipt className='h-4 w-4' />;
			default:
				return <CreditCard className='h-4 w-4' />;
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					leftIcon={<Plus className='h-4 w-4' />}
					variant='gradient'
					animation='scale'>
					Create New Bill
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[550px]'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2 text-xl'>
						<Receipt className='h-5 w-5 text-primary' />
						Create New Bill
					</DialogTitle>
					<DialogDescription>
						Select an order and payment method to generate a bill.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-5 animate-fade-in'>
					<div
						className='space-y-2 animate-slide-in'
						style={{ animationDelay: '0.1s' }}>
						<Label className='flex items-center gap-2 font-medium'>
							<ShoppingCart className='h-4 w-4 text-primary' />
							Select Order
						</Label>
						{availableOrders.length === 0 ? (
							<div className='flex items-center justify-center p-6 border border-dashed rounded-md text-muted-foreground'>
								<p className='text-center'>No orders available for billing</p>
							</div>
						) : (
							<div className='grid gap-2 max-h-48 overflow-y-auto p-2 border rounded-md bg-background/50'>
								{availableOrders.map(order => (
									<Button
										key={order.id}
										type='button'
										variant={
											selectedOrderId === order.id ? 'gradient' : 'outline'
										}
										size='sm'
										onClick={() => setSelectedOrderId(order.id)}
										className='justify-between hover:shadow-sm transition-all'>
										<span className='font-medium'>
											#{order.id.substring(0, 8)} - {order.customerName}
											{order.bill && (
												<span className='ml-2 text-xs uppercase text-muted-foreground'>
													(COMPLETED)
												</span>
											)}
										</span>
										<span className='bg-background/80 px-2 py-1 rounded text-sm'>
											₹{' '}
											{order.orderItems
												.reduce(
													(
														sum: number,
														item: { price: unknown; quantity: number }
													) => sum + Number(item.price) * item.quantity,
													0
												)
												.toFixed(2)}
										</span>
									</Button>
								))}
							</div>
						)}
					</div>

					{selectedOrder && (
						<>
							<div
								className='space-y-2 animate-slide-in'
								style={{ animationDelay: '0.2s' }}>
								<Label
									htmlFor='paymentMethod'
									className='flex items-center gap-2 font-medium'>
									<CreditCard className='h-4 w-4 text-emerald-500' />
									Payment Method
								</Label>
								<div className='relative'>
									<select
										id='paymentMethod'
										value={paymentMethod}
										onChange={e => setPaymentMethod(e.target.value)}
										className='flex h-11 md:h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all appearance-none'
										required>
										<option value='Cash'>Cash</option>
										<option value='Credit Card'>Credit Card</option>
										<option value='Debit Card'>Debit Card</option>
										<option value='UPI'>UPI</option>
										<option value='Bank Transfer'>Bank Transfer</option>
									</select>
									<div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground'>
										{getPaymentIcon(paymentMethod)}
									</div>
									<div className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none'>
										<ChevronDown className='h-4 w-4' />
									</div>
								</div>
							</div>

							<div
								className='border rounded-md p-5 space-y-3 shadow-sm bg-muted/30 animate-slide-in'
								style={{ animationDelay: '0.4s' }}>
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>Total:</span>
									<span className='font-medium'>₹{total.toFixed(2)}</span>
								</div>
							</div>
						</>
					)}

					<div
						className='flex justify-end space-x-3 pt-2 animate-slide-in'
						style={{ animationDelay: '0.5s' }}>
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								resetForm();
								setOpen(false);
							}}
							leftIcon={<X className='h-4 w-4' />}
							className='hover:bg-destructive/10 hover:text-destructive hover:border-destructive'>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={!selectedOrderId || isSubmitting}
							leftIcon={
								isSubmitting ? undefined : <Check className='h-4 w-4' />
							}
							isLoading={isSubmitting}
							variant='gradient'
							animation='scale'>
							Create Bill
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
