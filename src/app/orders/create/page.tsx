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
	const [retryCount, setRetryCount] = useState(0);
	const [lastOrderData, setLastOrderData] = useState<{
		customerName: string;
		status: OrderStatus;
		orderItems: Array<{
			itemId: string;
			quantity: number;
			price: number;
		}>;
		customMessage?: string;
	} | null>(null);

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

	// Handle form submission with retry logic
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!customerName || orderItems.length === 0) {
			return;
		}

		const orderData = {
			customerName,
			status: OrderStatus.PENDING,
			orderItems: orderItems,
			customMessage: customMessage || undefined
		};

		// Store order data for potential retry
		setLastOrderData(orderData);

		try {
			const result = await dispatch(createOrder(orderData));
			
			if (createOrder.fulfilled.match(result)) {
				// Success - reset retry count and navigate
				setRetryCount(0);
				setLastOrderData(null);
				router.push('/orders');
			} else if (createOrder.rejected.match(result)) {
				// Handle specific error types
				const errorMessage = result.payload as string;
				
				if (errorMessage.includes('timed out') && retryCount < 2) {
					// Auto-retry for timeout errors (max 2 retries)
					console.log(`Order creation timed out, retrying... (attempt ${retryCount + 1}/2)`);
					setRetryCount(prev => prev + 1);
					
					// Wait a bit before retrying
					setTimeout(() => {
						handleSubmit(e);
					}, 1000);
				} else {
					// Reset retry count for other errors or max retries reached
					setRetryCount(0);
					setLastOrderData(null);
				}
			}
		} catch (error) {
			console.error('Unexpected error during order creation:', error);
			setRetryCount(0);
			setLastOrderData(null);
		}
	};

	// Manual retry function
	const handleRetry = async () => {
		if (lastOrderData) {
			setRetryCount(0);
			
			try {
				const result = await dispatch(createOrder(lastOrderData));
				
				if (createOrder.fulfilled.match(result)) {
					// Success - reset and navigate
					setRetryCount(0);
					setLastOrderData(null);
					router.push('/orders');
				} else {
					// Reset retry count for any errors during manual retry
					setRetryCount(0);
					setLastOrderData(null);
				}
			} catch (error) {
				console.error('Unexpected error during manual retry:', error);
				setRetryCount(0);
				setLastOrderData(null);
			}
		}
	};

	return (
		<div className='container py-4 md:py-8'>
			<div className='flex items-center gap-4 mb-6'>
				<Button
					variant='outline'
					size='icon'
					onClick={() => router.push('/orders')}
					className='h-9 w-9 flex-shrink-0'>
					<ArrowLeft className='h-4 w-4' />
				</Button>
				<h1 className='text-xl md:text-2xl font-bold'>Create New Order</h1>
			</div>

			{error && (
				<div className='bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6'>
					<div className='flex items-start justify-between gap-3'>
						<div className='flex-1'>
							<p className='font-medium'>Error creating order:</p>
							<p className='text-sm mt-1'>{error}</p>
							{retryCount > 0 && (
								<p className='text-sm mt-2 text-muted-foreground'>
									Retry attempt {retryCount}/2 in progress...
								</p>
							)}
						</div>
						{lastOrderData && !orderLoading && !error.includes('timed out') && (
							<Button
								variant='outline'
								size='sm'
								onClick={handleRetry}
								className='flex-shrink-0'>
								Retry
							</Button>
						)}
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit}>
				<div className='grid gap-6'>
					{/* Customer Info Section */}
					<Card>
						<CardContent className='pt-6'>
							<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
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
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
						{/* Available Items (Left Column) */}
						<Card className='flex flex-col'>
							<CardContent className='pt-6 flex-1 flex flex-col'>
								<div className='flex flex-col h-full'>
									<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4'>
										<h2 className='text-lg font-semibold'>Available Items</h2>
										<div className='relative w-full sm:max-w-xs'>
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
										<div className='grid gap-2 max-h-[400px] md:max-h-[500px] overflow-y-auto p-2 border rounded-md flex-1'>
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
														className='justify-between h-auto py-3 hover:bg-muted/50 transition-colors'
														disabled={!item.inStock}>
														<div className='flex flex-col items-start min-w-0 flex-1'>
															<span className='font-medium truncate w-full text-left'>{item.name}</span>
															<span className='text-sm text-muted-foreground'>
																Available: {item.quantity}
															</span>
														</div>
														<div className='flex items-center flex-shrink-0 ml-2'>
															<span className='font-medium mr-2'>
																₹ {Number(item.price).toFixed(2)}
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
						<Card className='flex flex-col'>
							<CardContent className='pt-6 flex-1 flex flex-col'>
								<div className='flex flex-col h-full'>
									<h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
										<ShoppingCart className='h-4 w-4' />
										Selected Items
									</h2>

									{orderItems.length === 0 ? (
										<div className='border border-dashed rounded-md p-8 text-center flex-1 flex items-center justify-center'>
											<p className='text-muted-foreground'>
												No items selected. Add items from the left panel.
											</p>
										</div>
									) : (
										<div className='flex flex-col border rounded-md divide-y flex-1'>
											<div className='max-h-[300px] md:max-h-[400px] overflow-y-auto'>
												{orderItems.map(orderItem => {
													const item = items.find(i => i.id === orderItem.itemId);
													return (
														<div
															key={orderItem.itemId}
															className='flex items-center justify-between p-3 gap-3'>
															<div className='min-w-0 flex-1'>
																<p className='font-medium truncate'>{item?.name}</p>
																<span className='text-sm text-muted-foreground'>
																	₹ {orderItem.price} each
																</span>
															</div>
															<div className='flex items-center gap-2 flex-shrink-0'>
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
																<span className='w-8 text-center font-medium'>
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
											</div>
											<div className='p-3 flex justify-between bg-muted/30 font-bold'>
												<p>Total:</p>
												<p>₹ {total.toFixed(2)}</p>
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Submit Buttons */}
					<div className='flex flex-col sm:flex-row justify-end gap-3 mt-4'>
						<Button
							type='button'
							variant='outline'
							onClick={() => router.push('/orders')}
							className='w-full sm:w-auto'>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={
								!customerName || orderItems.length === 0 || orderLoading
							}
							className='w-full sm:w-auto min-w-[120px]'>
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
