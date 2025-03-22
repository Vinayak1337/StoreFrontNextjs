'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { fetchItems } from '@/lib/redux/slices/items.slice';
import { createOrder } from '@/lib/redux/slices/orders.slice';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { OrderStatus } from '@/types';
import {
	Search,
	Plus,
	Minus,
	ShoppingCart,
	ArrowLeft,
	Save
} from 'lucide-react';

interface OrderItem {
	itemId: string;
	quantity: number;
	price: number;
}

export default function CreateOrderPage() {
	const router = useRouter();
	const dispatch = useDispatch<AppDispatch>();
	const { items, loading: itemsLoading } = useSelector(
		(state: RootState) => state.items
	);
	const { loading: orderLoading, error } = useSelector(
		(state: RootState) => state.orders
	);

	const [customerName, setCustomerName] = useState('');
	const [customMessage, setCustomMessage] = useState('');
	const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
	const [searchTerm, setSearchTerm] = useState('');

	// Fetch items on component mount
	useEffect(() => {
		dispatch(fetchItems());
	}, [dispatch]);

	// Filter items based on search term
	const filteredItems = items.filter(item =>
		item.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

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

	// Handle form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!customerName || orderItems.length === 0) {
			return;
		}

		dispatch(
			createOrder({
				customerName,
				status: OrderStatus.PENDING,
				orderItems: orderItems,
				customMessage: customMessage || undefined
			})
		).then(() => {
			router.push('/orders');
		});
	};

	return (
		<div className='container py-8'>
			<div className='flex items-center gap-4 mb-6'>
				<Button
					variant='outline'
					size='icon'
					onClick={() => router.push('/orders')}
					className='h-9 w-9'>
					<ArrowLeft className='h-4 w-4' />
				</Button>
				<h1 className='text-2xl font-bold'>Create New Order</h1>
			</div>

			{error && (
				<div className='bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6'>
					<p>Error: {error}</p>
				</div>
			)}

			<form onSubmit={handleSubmit}>
				<div className='grid gap-6'>
					{/* Customer Info Section */}
					<Card>
						<CardContent className='pt-6'>
							<div className='grid md:grid-cols-2 gap-6'>
								<div className='space-y-2'>
									<Label htmlFor='customerName' className='text-base'>
										Customer Name
									</Label>
									<Input
										id='customerName'
										value={customerName}
										onChange={e => setCustomerName(e.target.value)}
										placeholder='Enter customer name'
										required
										className='h-10'
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='customMessage' className='text-base'>
										Message (Optional)
									</Label>
									<Textarea
										id='customMessage'
										placeholder='Add any special instructions or notes'
										value={customMessage}
										onChange={e => setCustomMessage(e.target.value)}
										className='min-h-[80px]'
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Items Selection Section */}
					<div className='grid md:grid-cols-2 gap-6'>
						{/* Available Items (Left Column) */}
						<Card>
							<CardContent className='pt-6'>
								<div className='flex flex-col h-full'>
									<div className='flex justify-between items-center mb-4'>
										<h2 className='text-lg font-semibold'>Available Items</h2>
										<div className='relative w-full max-w-xs'>
											<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
											<Input
												type='search'
												placeholder='Search items...'
												value={searchTerm}
												onChange={e => setSearchTerm(e.target.value)}
												className='pl-8'
											/>
										</div>
									</div>

									{itemsLoading ? (
										<div className='flex justify-center items-center py-10'>
											<div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
										</div>
									) : (
										<div className='grid gap-2 max-h-[400px] overflow-y-auto p-2 border rounded-md'>
											{filteredItems.length === 0 ? (
												<p className='text-center py-4 text-muted-foreground'>
													No items found
												</p>
											) : (
												filteredItems.map(item => (
													<Button
														key={item.id}
														type='button'
														variant='outline'
														onClick={() => addItem(item.id)}
														className='justify-between h-auto py-3'
														disabled={!item.inStock}>
														<div className='flex flex-col items-start'>
															<span className='font-medium'>{item.name}</span>
															<span className='text-sm text-muted-foreground'>
																Available: {item.quantity}
															</span>
														</div>
														<div className='flex items-center'>
															<span className='font-medium mr-2'>
																₹{Number(item.price).toFixed(2)}
															</span>
															<Plus className='h-4 w-4' />
														</div>
													</Button>
												))
											)}
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Selected Items (Right Column) */}
						<Card>
							<CardContent className='pt-6'>
								<div className='flex flex-col h-full'>
									<h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
										<ShoppingCart className='h-4 w-4' />
										Selected Items
									</h2>

									{orderItems.length === 0 ? (
										<div className='border border-dashed rounded-md p-8 text-center'>
											<p className='text-muted-foreground'>
												No items selected. Add items from the left panel.
											</p>
										</div>
									) : (
										<div className='flex flex-col border rounded-md divide-y'>
											{orderItems.map(orderItem => {
												const item = items.find(i => i.id === orderItem.itemId);
												return (
													<div
														key={orderItem.itemId}
														className='flex items-center justify-between p-3'>
														<div>
															<p className='font-medium'>{item?.name}</p>
															<p className='text-sm text-muted-foreground'>
																₹{orderItem.price} each
															</p>
														</div>
														<div className='flex items-center gap-2'>
															<Button
																type='button'
																size='icon'
																variant='outline'
																onClick={() =>
																	updateQuantity(
																		orderItem.itemId,
																		orderItem.quantity - 1
																	)
																}
																className='h-8 w-8'>
																<Minus className='h-3 w-3' />
															</Button>
															<span className='w-8 text-center'>
																{orderItem.quantity}
															</span>
															<Button
																type='button'
																size='icon'
																variant='outline'
																onClick={() =>
																	updateQuantity(
																		orderItem.itemId,
																		orderItem.quantity + 1
																	)
																}
																className='h-8 w-8'>
																<Plus className='h-3 w-3' />
															</Button>
														</div>
													</div>
												);
											})}
											<div className='p-3 flex justify-between bg-muted/30'>
												<p className='font-bold'>Total:</p>
												<p className='font-bold'>₹{total.toFixed(2)}</p>
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Submit Buttons */}
					<div className='flex justify-end gap-3 mt-4'>
						<Button
							type='button'
							variant='outline'
							onClick={() => router.push('/orders')}>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={
								!customerName || orderItems.length === 0 || orderLoading
							}
							className='min-w-[120px]'>
							{orderLoading ? (
								<div className='flex items-center gap-2'>
									<div className='animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full'></div>
									<span>Creating...</span>
								</div>
							) : (
								<div className='flex items-center gap-2'>
									<Save className='h-4 w-4' />
									<span>Save Order</span>
								</div>
							)}
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
