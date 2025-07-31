import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { getOrderById, getOrders } from '@/app/api/orders/actions';
import { OrderDetailActions } from '@/components/orders/order-detail-actions';
import { OrderDetailNavigation } from '@/components/orders/order-detail-navigation';

interface PageProps {
	params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
	try {
		const orders = await getOrders();
		
		return orders.map((order) => ({
			id: order.id,
		}));
	} catch (error) {
		console.error('Error generating static params for orders:', error);
		return [];
	}
}

export default async function OrderDetailsPage({ params }: PageProps) {
	const resolvedParams = await params;
	const orderId = resolvedParams.id;

	const order = await getOrderById(orderId);

	if (!order) {
		notFound();
	}

	const total = order.orderItems.reduce(
		(sum, item) => sum + Number(item.price) * item.quantity,
		0
	);

	return (
		<div className='container py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6'>
			<div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6'>
				<div className='flex items-center gap-3 sm:gap-4'>
					<OrderDetailNavigation />
					<h1 className='text-xl sm:text-2xl font-bold'>Order Details</h1>
					<Badge
						className='text-xs'
						variant={order.bill ? 'default' : 'secondary'}>
						{order.bill ? 'COMPLETED' : 'PENDING'}
					</Badge>
				</div>

				<div className='sm:ml-auto'>
					<OrderDetailActions order={order} />
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
				<Card>
					<CardHeader className='pb-3'>
						<CardTitle className='text-lg'>Order Information</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3'>
						<div className='grid grid-cols-1 gap-2 text-sm'>
							<div className='flex justify-between py-1'>
								<span className='text-muted-foreground'>Order ID:</span>
								<span className='font-medium text-right break-all'>
									{order.id}
								</span>
							</div>

							<div className='flex justify-between py-1'>
								<span className='text-muted-foreground'>Customer Name:</span>
								<span className='font-medium text-right'>
									{order.customerName}
								</span>
							</div>

							<div className='flex justify-between py-1'>
								<span className='text-muted-foreground'>Date:</span>
								<span className='font-medium text-right'>
									{format(new Date(order.createdAt), 'PPP')}
								</span>
							</div>

							{order.customMessage && (
								<div className='flex flex-col sm:flex-row sm:justify-between py-1 gap-1'>
									<span className='text-muted-foreground'>Custom Message:</span>
									<span className='font-medium text-right break-words'>
										{order.customMessage}
									</span>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='pb-3'>
						<CardTitle className='text-lg'>Order Summary</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3'>
						<div className='grid grid-cols-1 gap-2 text-sm'>
							<div className='flex justify-between py-1'>
								<span className='text-muted-foreground'>Items Count:</span>
								<span className='font-medium'>{order.orderItems.length}</span>
							</div>

							<div className='flex justify-between py-1'>
								<span className='text-muted-foreground'>
									Total Items Quantity:
								</span>
								<span className='font-medium'>
									{order.orderItems.reduce(
										(sum, item) => sum + item.quantity,
										0
									)}{' '}
									units
								</span>
							</div>

							<div className='flex justify-between py-1 border-t pt-2 mt-2'>
								<span className='text-muted-foreground font-bold'>
									Order Total:
								</span>
								<span className='font-bold text-lg'>
									{'₹'} {total.toFixed(2)}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className='mt-4 sm:mt-6'>
				<CardHeader className='pb-3'>
					<CardTitle className='text-lg'>Order Items</CardTitle>
				</CardHeader>
				<CardContent>
					{/* Desktop/Tablet Table View */}
					<div className='hidden sm:block border rounded-md overflow-hidden'>
						<table className='w-full'>
							<thead className='bg-muted'>
								<tr>
									<th className='text-left p-3 text-sm font-medium'>Item</th>
									<th className='text-right p-3 text-sm font-medium'>
										Quantity
									</th>
									<th className='text-right p-3 text-sm font-medium'>Price</th>
									<th className='text-right p-3 text-sm font-medium'>Total</th>
								</tr>
							</thead>
							<tbody>
								{order.orderItems.map(item => (
									<tr key={item.id} className='border-t'>
										<td className='p-3 text-sm'>
											{item.item?.name ||
												`Item #${item.itemId.substring(0, 6)}`}
										</td>
										<td className='p-3 text-right text-sm'>{item.quantity}</td>
										<td className='p-3 text-right text-sm'>
											{'₹'} {Number(item.price).toFixed(2)}
										</td>
										<td className='p-3 text-right text-sm font-medium'>
											{'₹'} {(Number(item.price) * item.quantity).toFixed(2)}
										</td>
									</tr>
								))}
								<tr className='border-t bg-muted/50'>
									<td
										colSpan={3}
										className='p-3 text-right font-medium text-sm'>
										Total:
									</td>
									<td className='p-3 text-right font-bold'>
										{'₹'} {total.toFixed(2)}
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					{/* Mobile Card View */}
					<div className='sm:hidden space-y-3'>
						{order.orderItems.map(item => (
							<div key={item.id} className='border rounded-lg p-3 bg-card'>
								<div className='flex justify-between items-start mb-2'>
									<h4 className='font-medium text-sm truncate pr-2'>
										{item.item?.name || `Item #${item.itemId.substring(0, 6)}`}
									</h4>
									<span className='font-bold text-sm'>
										{'₹'} {(Number(item.price) * item.quantity).toFixed(2)}
									</span>
								</div>
								<div className='flex justify-between text-xs text-muted-foreground'>
									<span>Qty: {item.quantity}</span>
									<span>
										Price: {'₹'} {Number(item.price).toFixed(2)}
									</span>
								</div>
							</div>
						))}

						<div className='border-t pt-3 mt-3'>
							<div className='flex justify-between items-center bg-muted/50 rounded-lg p-3'>
								<span className='font-bold text-sm'>Order Total:</span>
								<span className='font-bold text-lg'>
									{'₹'} {total.toFixed(2)}
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className='mt-4 sm:mt-6 flex justify-center'>
				<OrderDetailNavigation variant='button' />
			</div>
		</div>
	);
}
