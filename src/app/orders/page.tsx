'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
	fetchOrders,
	updateOrderStatus,
	deleteOrder
} from '@/lib/redux/slices/orders.slice';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { OrderStatus } from '@/types';
import { Plus, Eye, ChevronUp, Trash } from 'lucide-react';

export default function OrdersPage() {
	const router = useRouter();
	const dispatch = useDispatch<AppDispatch>();
	const { orders, loading, error } = useSelector(
		(state: RootState) => state.orders
	);
	const [expandedOrders] = useState<string[]>([]);

	useEffect(() => {
		dispatch(fetchOrders());
	}, [dispatch]);

	const handleCompleteOrder = (orderId: string) => {
		dispatch(updateOrderStatus({ id: orderId, status: OrderStatus.COMPLETED }));
	};

	const handleCancelOrder = (orderId: string) => {
		dispatch(updateOrderStatus({ id: orderId, status: OrderStatus.CANCELLED }));
	};

	const handleDeleteOrder = (orderId: string) => {
		if (
			confirm(
				'Are you sure you want to delete this order? This action cannot be undone.'
			)
		) {
			dispatch(deleteOrder(orderId));
		}
	};

	const handleViewDetails = (orderId: string) => {
		router.push(`/orders/${orderId}`);
	};

	return (
		<div className='flex flex-col min-h-screen'>
			<header className='sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6'>
				<div className='flex flex-1 items-center justify-between'>
					<h1 className='text-xl font-semibold'>Orders Management</h1>
					<Button
						onClick={() => router.push('/orders/create')}
						className='flex items-center gap-2'>
						<Plus className='h-4 w-4' />
						Create New Order
					</Button>
				</div>
			</header>
			<main className='flex-1 p-6'>
				<div className='space-y-6'>
					<h2 className='text-2xl font-bold tracking-tight'>Orders</h2>

					{loading && <p className='text-center py-4'>Loading orders...</p>}

					{error && (
						<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
							<p>Error: {error}</p>
						</div>
					)}

					{!loading && !error && orders.length === 0 && (
						<div className='border rounded-md p-8 text-center'>
							<p className='text-muted-foreground'>
								No orders found. Create a new order to get started.
							</p>
						</div>
					)}

					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
						{orders.map(order => (
							<Card key={order.id}>
								<CardHeader className='pb-2'>
									<div className='flex items-center justify-between'>
										<CardTitle className='text-lg'>
											Order #{order.id.substring(0, 8)}
										</CardTitle>
										<Badge
											variant={
												order.status === OrderStatus.COMPLETED
													? 'success'
													: order.status === OrderStatus.CANCELLED
													? 'destructive'
													: 'default'
											}>
											{order.status}
										</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div className='grid gap-2'>
										<div className='flex items-center justify-between text-sm'>
											<span className='text-muted-foreground'>Customer:</span>
											<span>{order.customerName}</span>
										</div>
										<div className='flex items-center justify-between text-sm'>
											<span className='text-muted-foreground'>Date:</span>
											<span>
												{format(new Date(order.createdAt), 'MMM dd, yyyy')}
											</span>
										</div>
										<div className='flex items-center justify-between text-sm'>
											<span className='text-muted-foreground'>Items:</span>
											<span>{order.orderItems.length}</span>
										</div>
										<div className='flex items-center justify-between font-medium mt-1'>
											<span>Total:</span>
											<span>
												₹{' '}
												{order.orderItems
													.reduce(
														(
															sum: number,
															item: { price: number; quantity: number }
														) => sum + item.price * item.quantity,
														0
													)
													.toFixed(2)}
											</span>
										</div>

										{expandedOrders.includes(order.id) && (
											<div className='mt-2 pt-2 border-t'>
												<h4 className='text-sm font-medium mb-1'>
													Order Items:
												</h4>
												<ul className='text-sm space-y-1'>
													{order.orderItems.map(item => (
														<li key={item.id} className='flex justify-between'>
															<span>
																{item.quantity}x{' '}
																{item.item?.name ||
																	`Item #${item.itemId.substring(0, 6)}`}
															</span>
															<div className='ml-auto text-right'>
																₹ {(item.price * item.quantity).toFixed(2)}
															</div>
														</li>
													))}
												</ul>
											</div>
										)}

										<div className='flex justify-between mt-4'>
											<Button
												variant='ghost'
												size='sm'
												className='text-red-500 hover:text-red-700 hover:bg-red-50'
												onClick={() => handleDeleteOrder(order.id)}>
												<Trash className='h-4 w-4 mr-1' />
												Delete
											</Button>

											<div className='flex gap-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleViewDetails(order.id)}>
													{expandedOrders.includes(order.id) ? (
														<ChevronUp className='h-4 w-4 mr-1' />
													) : (
														<Eye className='h-4 w-4 mr-1' />
													)}
													{expandedOrders.includes(order.id)
														? 'Hide Details'
														: 'View Details'}
												</Button>

												{order.status === OrderStatus.PENDING && (
													<>
														<Button
															variant='outline'
															size='sm'
															onClick={() => handleCancelOrder(order.id)}>
															Cancel
														</Button>
														<Button
															size='sm'
															onClick={() => handleCompleteOrder(order.id)}>
															Complete
														</Button>
													</>
												)}
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
