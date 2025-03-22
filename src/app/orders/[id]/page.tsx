'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RootState, AppDispatch } from '@/lib/redux/store';
import {
	fetchOrders,
	updateOrderStatus,
	deleteOrder
} from '@/lib/redux/slices/orders.slice';
import { fetchSettings } from '@/lib/redux/slices/settings.slice';
import { createBill } from '@/lib/redux/slices/bills.slice';
import { OrderStatus } from '@/types';
import { ArrowLeft, Check, XCircle, Trash } from 'lucide-react';
import { toast } from 'react-toastify';

export default function OrderDetailsPage() {
	const router = useRouter();
	const params = useParams();
	const orderId = params.id as string;

	const dispatch = useDispatch<AppDispatch>();
	const { orders, loading, error } = useSelector(
		(state: RootState) => state.orders
	);
	const { settings } = useSelector((state: RootState) => state.settings);

	useEffect(() => {
		dispatch(fetchOrders());
		dispatch(fetchSettings());
	}, [dispatch]);

	const order = orders.find(o => o.id === orderId);

	const handleCompleteOrder = async () => {
		if (!order) return;

		try {
			// First update the status to completed
			await dispatch(
				updateOrderStatus({
					id: order.id,
					status: OrderStatus.COMPLETED
				})
			);

			// Calculate total for creating bill
			const total = order.orderItems.reduce(
				(sum, item) => sum + Number(item.price) * item.quantity,
				0
			);

			// Create a bill for the completed order
			const billResult = await dispatch(
				createBill({
					orderId: order.id,
					totalAmount: total,
					taxes: 0,
					paymentMethod: 'Cash' // Default payment method
				})
			);

			// If bill creation was successful, navigate to the bill details
			if (createBill.fulfilled.match(billResult)) {
				toast.success('Order completed and bill created');
				router.push(`/bills/${billResult.payload.id}`);
			} else {
				toast.success('Order marked as completed');
			}
		} catch (error) {
			toast.error('Failed to complete order');
			console.error(error);
		}
	};

	const handleCancelOrder = () => {
		if (!order) return;
		dispatch(
			updateOrderStatus({ id: order.id, status: OrderStatus.CANCELLED })
		);
		toast.success('Order marked as cancelled');
	};

	const handleDeleteOrder = () => {
		if (!order) return;
		if (
			confirm(
				'Are you sure you want to delete this order? This action cannot be undone.'
			)
		) {
			dispatch(deleteOrder(order.id));
			router.push('/orders');
		}
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

	if (!order) {
		return (
			<div className='container py-8'>
				<div className='bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md'>
					<p>Order not found</p>
				</div>
			</div>
		);
	}

	// Calculate total
	const total = order.orderItems.reduce(
		(sum, item) => sum + Number(item.price) * item.quantity,
		0
	);

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
				<h1 className='text-2xl font-bold'>Order Details</h1>

				<Badge
					className='ml-4'
					variant={
						order.status === OrderStatus.COMPLETED
							? 'success'
							: order.status === OrderStatus.CANCELLED
							? 'destructive'
							: 'default'
					}>
					{order.status}
				</Badge>

				<div className='ml-auto'>
					{order.status === OrderStatus.PENDING && (
						<div className='flex gap-2'>
							<Button
								variant='outline'
								onClick={handleCancelOrder}
								className='flex items-center gap-2'>
								<XCircle className='h-4 w-4' />
								Cancel Order
							</Button>
							<Button
								onClick={handleCompleteOrder}
								className='flex items-center gap-2'>
								<Check className='h-4 w-4' />
								Complete Order
							</Button>
						</div>
					)}
				</div>
			</div>

			<div className='grid md:grid-cols-2 gap-6'>
				<Card>
					<CardHeader>
						<CardTitle>Order Information</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid grid-cols-2 gap-2'>
							<span className='text-muted-foreground'>Order ID:</span>
							<span className='font-medium'>{order.id}</span>

							<span className='text-muted-foreground'>Customer Name:</span>
							<span className='font-medium'>{order.customerName}</span>

							<span className='text-muted-foreground'>Date:</span>
							<span className='font-medium'>
								{format(new Date(order.createdAt), 'PPP')}
							</span>

							<span className='text-muted-foreground'>Status:</span>
							<span className='font-medium'>{order.status}</span>

							{order.customMessage && (
								<>
									<span className='text-muted-foreground'>Custom Message:</span>
									<span className='font-medium'>{order.customMessage}</span>
								</>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Order Summary</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid grid-cols-2 gap-2'>
							<span className='text-muted-foreground'>Items Count:</span>
							<span className='font-medium'>{order.orderItems.length}</span>

							<span className='text-muted-foreground'>
								Total Items Quantity:
							</span>
							<span className='font-medium'>
								{order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}{' '}
								units
							</span>

							<span className='text-muted-foreground font-bold'>
								Order Total:
							</span>
							<span className='font-bold'>
								{settings?.currency || '₹'} {total.toFixed(2)}
							</span>
						</div>
					</CardContent>
				</Card>
			</div>

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
								{order.orderItems.map(item => (
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
										{settings?.currency || '₹'} {total.toFixed(2)}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			<div className='mt-6 flex justify-between'>
				<Button
					variant='ghost'
					onClick={handleDeleteOrder}
					className='text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-2'>
					<Trash className='h-4 w-4' />
					Delete Order
				</Button>

				<Button variant='outline' onClick={() => router.push('/orders')}>
					Back to Orders
				</Button>
			</div>
		</div>
	);
}
