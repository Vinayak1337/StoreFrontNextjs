import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrders } from '@/app/api/orders/actions';
import { OrderActions } from '@/components/orders/order-actions';
import { PairPrinterButton } from '@/components/orders/pair-printer-button';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function OrdersPage() {
	const orders = await getOrders();

	return (
		<div className='flex flex-col min-h-screen'>
			<header className='sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6'>
				<div className='flex flex-1 items-center justify-between'>
					<h1 className='text-xl font-semibold'>Orders Management</h1>
					<div className='flex items-center gap-2'>
						<Link href='/orders/create'>
							<Button className='flex items-center gap-2 text-sm md:text-base'>
								<Plus className='h-4 w-4' />
								<span className='hidden sm:inline'>Create New Order</span>
								<span className='sm:hidden'>Create</span>
							</Button>
						</Link>
						<PairPrinterButton />
					</div>
				</div>
			</header>
			<main className='flex-1 p-4 md:p-6'>
				<div className='space-y-6'>
					<h2 className='text-2xl font-bold tracking-tight'>Orders</h2>

					{!orders || orders.length === 0 ? (
						<div className='border rounded-md p-8 text-center'>
							<p className='text-muted-foreground'>
								No orders found. Create a new order to get started.
							</p>
						</div>
					) : (
						<div className='grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
							{orders.map(order => (
								<Card key={order.id} className='flex flex-col'>
									<CardHeader className='pb-2'>
										<div className='flex items-center justify-between'>
											<CardTitle className='text-base md:text-lg'>
												Order #{order.id.substring(0, 8)}
											</CardTitle>
										</div>
									</CardHeader>
									<CardContent className='flex-1 flex flex-col'>
										<div className='grid gap-2 flex-1'>
											<div className='flex items-center justify-between text-sm'>
												<span className='text-muted-foreground'>Customer:</span>
												<span className='font-medium truncate ml-2'>
													{order.customerName}
												</span>
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
													₹
													{order.orderItems
														.reduce(
															(sum, item) =>
																sum + Number(item.price) * item.quantity,
															0
														)
														.toFixed(2)}
												</span>
											</div>
										</div>

										<OrderActions order={order} />
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
