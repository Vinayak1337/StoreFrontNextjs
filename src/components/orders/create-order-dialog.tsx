'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger
} from '@/components/ui/dialog';
import { fetchItems } from '@/lib/redux/slices/items.slice';
import { createOrder } from '@/lib/redux/slices/orders.slice';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { OrderStatus } from '@/types';

interface OrderItem {
	itemId: string;
	quantity: number;
	price: number;
}

export function CreateOrderDialog() {
	const dispatch = useDispatch<AppDispatch>();
	const [open, setOpen] = useState(false);
	const { items } = useSelector((state: RootState) => state.items);
	const [customerName, setCustomerName] = useState('');
	const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
	const [customMessage, setCustomMessage] = useState('');

	// Fetch items when dialog opens
	useEffect(() => {
		if (open && items.length === 0) {
			dispatch(fetchItems());
		}
	}, [open, dispatch, items.length]);

	// Add an item to the order
	const addItem = (itemId: string) => {
		const item = items.find(i => i.id === itemId);
		if (!item) return;

		const existingItem = orderItems.find(i => i.itemId === itemId);
		if (existingItem) {
			// Update quantity if item already exists
			setOrderItems(
				orderItems.map(i =>
					i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
				)
			);
		} else {
			// Add new item
			setOrderItems([
				...orderItems,
				{
					itemId,
					quantity: 1,
					price: Number(item.price)
				}
			]);
		}
	};

	// Remove an item from the order
	const removeItem = (itemId: string) => {
		setOrderItems(orderItems.filter(i => i.itemId !== itemId));
	};

	// Update item quantity
	const updateQuantity = (itemId: string, quantity: number) => {
		if (quantity <= 0) {
			removeItem(itemId);
			return;
		}

		setOrderItems(
			orderItems.map(i => (i.itemId === itemId ? { ...i, quantity } : i))
		);
	};

	// Calculate total
	const total = orderItems.reduce(
		(sum: number, item: OrderItem) => sum + item.price * item.quantity,
		0
	);

	// Reset form
	const resetForm = () => {
		setCustomerName('');
		setOrderItems([]);
		setCustomMessage('');
	};

	// Handle form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!customerName || orderItems.length === 0) return;

		dispatch(
			createOrder({
				customerName,
				status: OrderStatus.PENDING,
				orderItems: orderItems,
				customMessage: customMessage || undefined
			})
		);

		resetForm();
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Create New Order</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[550px]'>
				<DialogHeader>
					<DialogTitle>Create New Order</DialogTitle>
					<DialogDescription>
						Fill out the form below to create a new customer order.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='customerName'>Customer Name</Label>
						<Input
							id='customerName'
							value={customerName}
							onChange={e => setCustomerName(e.target.value)}
							required
						/>
					</div>

					<div className='space-y-2'>
						<Label>Select Items</Label>
						<div className='grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md'>
							{items.map(item => (
								<Button
									key={item.id}
									type='button'
									variant='outline'
									size='sm'
									onClick={() => addItem(item.id)}
									className='justify-start'>
									{item.name} - ₹{item.price}
								</Button>
							))}
						</div>
					</div>

					<div className='space-y-2'>
						<Label>Order Items</Label>
						{orderItems.length === 0 ? (
							<p className='text-muted-foreground text-sm'>
								No items added yet
							</p>
						) : (
							<div className='border rounded-md divide-y'>
								{orderItems.map(orderItem => {
									const item = items.find(i => i.id === orderItem.itemId);
									return (
										<div
											key={orderItem.itemId}
											className='flex items-center justify-between p-2'>
											<div>
												<p className='font-medium'>{item?.name}</p>
												<p className='text-sm text-muted-foreground'>
													₹{orderItem.price} each
												</p>
											</div>
											<div className='flex items-center gap-2'>
												<Button
													type='button'
													size='sm'
													variant='outline'
													onClick={() =>
														updateQuantity(
															orderItem.itemId,
															orderItem.quantity - 1
														)
													}>
													-
												</Button>
												<span>{orderItem.quantity}</span>
												<Button
													type='button'
													size='sm'
													variant='outline'
													onClick={() =>
														updateQuantity(
															orderItem.itemId,
															orderItem.quantity + 1
														)
													}>
													+
												</Button>
												<Button
													type='button'
													size='sm'
													variant='destructive'
													onClick={() => removeItem(orderItem.itemId)}>
													Remove
												</Button>
											</div>
										</div>
									);
								})}
								<div className='p-2 flex justify-between'>
									<p className='font-bold'>Total:</p>
									<p className='font-bold'>₹{total.toFixed(2)}</p>
								</div>
							</div>
						)}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='customMessage'>Custom Message (Optional)</Label>
						<Textarea
							id='customMessage'
							placeholder='Add any special instructions or notes for this order'
							value={customMessage}
							onChange={e => setCustomMessage(e.target.value)}
							className='min-h-[80px]'
						/>
					</div>

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
						<Button
							type='submit'
							disabled={!customerName || orderItems.length === 0}>
							Create Order
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
