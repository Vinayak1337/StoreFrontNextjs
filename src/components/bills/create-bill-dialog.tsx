'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { fetchOrders } from '@/lib/redux/slices/orders.slice';
import { createBill } from '@/lib/redux/slices/bills.slice';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { OrderStatus } from '@/types';

export function CreateBillDialog() {
	const dispatch = useDispatch<AppDispatch>();
	const [open, setOpen] = useState(false);
	const { orders } = useSelector((state: RootState) => state.orders);
	const [selectedOrderId, setSelectedOrderId] = useState('');
	const [paymentMethod, setPaymentMethod] = useState('Cash');
	const [taxRate, setTaxRate] = useState(10); // Default 10% tax rate

	// Fetch orders when dialog opens
	useEffect(() => {
		if (open && orders.length === 0) {
			dispatch(fetchOrders());
		}
	}, [open, dispatch, orders.length]);

	// Filter only PENDING orders
	const pendingOrders = orders.filter(
		order => order.status === OrderStatus.PENDING && !order.bill
	);

	// Get selected order
	const selectedOrder = orders.find(order => order.id === selectedOrderId);

	// Calculate subtotal for selected order
	const calculateSubtotal = () => {
		if (!selectedOrder) return 0;

		return selectedOrder.orderItems.reduce(
			(sum, item) => sum + Number(item.price) * item.quantity,
			0
		);
	};

	const subtotal = calculateSubtotal();
	const taxAmount = subtotal * (taxRate / 100);
	const total = subtotal + taxAmount;

	// Reset form
	const resetForm = () => {
		setSelectedOrderId('');
		setPaymentMethod('Cash');
		setTaxRate(10);
	};

	// Handle form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedOrderId) return;

		dispatch(
			createBill({
				orderId: selectedOrderId,
				totalAmount: total,
				taxes: taxAmount,
				paymentMethod
			})
		);

		resetForm();
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Create New Bill</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[550px]'>
				<DialogHeader>
					<DialogTitle>Create New Bill</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-2'>
						<Label>Select Order</Label>
						{pendingOrders.length === 0 ? (
							<p className='text-muted-foreground text-sm'>
								No pending orders available
							</p>
						) : (
							<div className='grid gap-2 max-h-48 overflow-y-auto p-2 border rounded-md'>
								{pendingOrders.map(order => (
									<Button
										key={order.id}
										type='button'
										variant={
											selectedOrderId === order.id ? 'default' : 'outline'
										}
										size='sm'
										onClick={() => setSelectedOrderId(order.id)}
										className='justify-between'>
										<span>
											#{order.id.substring(0, 8)} - {order.customerName}
										</span>
										<span>
											$
											{order.orderItems
												.reduce(
													(sum, item) =>
														sum + Number(item.price) * item.quantity,
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
							<div className='space-y-2'>
								<Label htmlFor='paymentMethod'>Payment Method</Label>
								<select
									id='paymentMethod'
									value={paymentMethod}
									onChange={e => setPaymentMethod(e.target.value)}
									className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
									required>
									<option value='Cash'>Cash</option>
									<option value='Credit Card'>Credit Card</option>
									<option value='Debit Card'>Debit Card</option>
									<option value='UPI'>UPI</option>
									<option value='Bank Transfer'>Bank Transfer</option>
								</select>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='taxRate'>Tax Rate (%)</Label>
								<Input
									id='taxRate'
									type='number'
									step='0.01'
									min='0'
									max='100'
									value={taxRate}
									onChange={e => setTaxRate(parseFloat(e.target.value))}
									required
								/>
							</div>

							<div className='border rounded-md p-4 space-y-2'>
								<div className='flex justify-between'>
									<span>Subtotal:</span>
									<span>${subtotal.toFixed(2)}</span>
								</div>
								<div className='flex justify-between'>
									<span>Tax ({taxRate}%):</span>
									<span>${taxAmount.toFixed(2)}</span>
								</div>
								<div className='flex justify-between font-bold'>
									<span>Total:</span>
									<span>${total.toFixed(2)}</span>
								</div>
							</div>
						</>
					)}

					<div className='flex justify-end space-x-2 pt-4'>
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								resetForm();
								setOpen(false);
							}}>
							Cancel
						</Button>
						<Button type='submit' disabled={!selectedOrderId}>
							Create Bill
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
