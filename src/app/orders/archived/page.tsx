import { format, isToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getArchivedOrders } from '@/app/api/orders/actions';
import { ArchivedOrderActions } from '@/components/orders/archived-order-actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function ArchivedOrdersPage() {
	const orders = await getArchivedOrders();

	// Group orders by date
	const groupOrdersByDate = (orders: BasicOrder[]) => {
		const grouped = new Map<string, BasicOrder[]>();
		
		orders.forEach(order => {
			const orderDate = new Date(order.createdAt);
			let dateKey: string;
			
			if (isToday(orderDate)) {
				dateKey = 'Today';
			} else {
				dateKey = format(orderDate, 'EEEE, MMM dd, yyyy');
			}
			
			if (!grouped.has(dateKey)) {
				grouped.set(dateKey, []);
			}
			grouped.get(dateKey)!.push(order);
		});
		
		return grouped;
	};

	const groupedOrders = groupOrdersByDate(orders);

	return (
		<div className='flex flex-col min-h-screen'>
			<header className='sticky top-0 z-10 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-background px-3 sm:px-4 md:px-6'>
				<div className='flex flex-1 items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Link href='/orders'>
							<Button
								variant='ghost'
								size='sm'
								className='flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base'>
								<ArrowLeft className='h-3 w-3 sm:h-4 sm:w-4' />
								<span className='hidden xs:inline sm:hidden'>Back</span>
								<span className='hidden sm:inline'>Back to Orders</span>
							</Button>
						</Link>
						<h1 className='text-lg sm:text-xl font-semibold truncate'>
							Archived Orders
						</h1>
					</div>
				</div>
			</header>
			<main className='flex-1 p-3 sm:p-4 md:p-6'>
				<div className='space-y-4 sm:space-y-6'>
					<h2 className='text-xl sm:text-2xl font-bold tracking-tight'>
						Archived Orders
					</h2>

					{orders.length === 0 ? (
						<div className='border rounded-md p-6 sm:p-8 text-center'>
							<p className='text-muted-foreground text-sm sm:text-base'>
								No archived orders found.
							</p>
						</div>
					) : (
						<div className='space-y-6'>
							{Array.from(groupedOrders.entries()).map(([dateKey, dateOrders]) => (
								<div key={dateKey} className='space-y-3'>
									<h3 className='text-lg font-semibold text-muted-foreground border-b pb-2'>
										{dateKey}
									</h3>
									<div className='grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4'>
										{dateOrders.map(order => (
											<Card key={order.id} className='flex flex-col opacity-75'>
												<CardHeader className='pb-2 p-3 sm:p-4'>
													<div className='flex items-center justify-between'>
														<CardTitle className='text-sm sm:text-base md:text-lg truncate'>
															Order #{order.id.substring(0, 8)}
														</CardTitle>
														<span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded'>
															Archived
														</span>
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
															<span className='text-muted-foreground'>Time:</span>
															<span className='text-right'>
																{format(new Date(order.createdAt), 'HH:mm')}
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

													<ArchivedOrderActions order={order} />
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}