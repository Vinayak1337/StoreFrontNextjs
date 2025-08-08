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
			<header className='sticky top-0 z-10 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-background px-3 sm:px-4 md:px-6'>
				<div className='flex flex-1 items-center justify-between'>
					<h1 className='text-lg sm:text-xl font-semibold truncate'>
						Orders Management
					</h1>
					<div className='flex items-center gap-1 sm:gap-2'>
                        <Link href='/orders/create'>
                            <Button
                                size='sm'
                                className='flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base bg-emerald-600 hover:bg-emerald-700 text-white'>
								<Plus className='h-3 w-3 sm:h-4 sm:w-4' />
								<span className='hidden xs:inline sm:hidden'>New</span>
								<span className='hidden sm:inline'>Create New Order</span>
							</Button>
						</Link>
						<PairPrinterButton />
					</div>
				</div>
			</header>
			<main className='flex-1 p-3 sm:p-4 md:p-6'>
				<div className='space-y-4 sm:space-y-6'>
					<h2 className='text-xl sm:text-2xl font-bold tracking-tight'>
						Orders
					</h2>

					{orders.length === 0 ? (
						<div className='border rounded-md p-6 sm:p-8 text-center'>
							<p className='text-muted-foreground text-sm sm:text-base'>
								No orders found. Create a new order to get started.
							</p>
						</div>
					) : (
						<div className='grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
							{orders.map(order => (
								<Card key={order.id} className='flex flex-col'>
									<CardHeader className='pb-2 p-3 sm:p-4'>
										<div className='flex items-center justify-between'>
											<CardTitle className='text-sm sm:text-base md:text-lg truncate'>
												Order #{order.id.substring(0, 8)}
											</CardTitle>
										</div>
									</CardHeader>
									<CardContent className='flex-1 flex flex-col p-3 sm:p-4 pt-0'>
										<div className='grid gap-1.5 sm:gap-2 flex-1'>
											<div className='flex items-center justify-between text-xs sm:text-sm'>
												<span className='text-muted-foreground'>Customer:</span>
												<span className='font-medium truncate ml-2 text-right'>
													{order.customerName}
												</span>
											</div>
											<div className='flex items-center justify-between text-xs sm:text-sm'>
												<span className='text-muted-foreground'>Date:</span>
												<span className='text-right'>
													{format(new Date(order.createdAt), 'MMM dd, yyyy')}
												</span>
											</div>
											<div className='flex items-center justify-between text-xs sm:text-sm'>
												<span className='text-muted-foreground'>Items:</span>
												<span>{order.itemsCount}</span>
											</div>
											<div className='flex items-center justify-between font-medium mt-1 text-xs sm:text-sm'>
												<span>Total:</span>
												<span className='text-right'>
													₹{order.totalAmount.toFixed(2)}
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
