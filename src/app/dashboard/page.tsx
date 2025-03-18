'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import {
	Activity,
	ShoppingBag,
	DollarSign,
	Receipt,
	ShoppingCart,
	ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { SalesChart } from '@/components/analytics/sales-chart';
import { MetricsCard } from '@/components/analytics/metrics-card';
import { fetchItems } from '@/lib/redux/slices/items.slice';
import { fetchOrders } from '@/lib/redux/slices/orders.slice';
import { fetchBills } from '@/lib/redux/slices/bills.slice';
import { fetchDailySales } from '@/lib/redux/slices/analytics.slice';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { OrderStatus } from '@/types';

export default function DashboardPage() {
	const dispatch = useDispatch<AppDispatch>();
	const { items } = useSelector((state: RootState) => state.items);
	const { orders } = useSelector((state: RootState) => state.orders);
	const { bills } = useSelector((state: RootState) => state.bills);
	// We're not directly using salesData but we're passing it to SalesChart component
	useSelector((state: RootState) => state.analytics);

	// Get counts
	const pendingOrdersCount = orders.filter(
		order => order.status === OrderStatus.PENDING
	).length;
	const completedOrdersCount = orders.filter(
		order => order.status === OrderStatus.COMPLETED
	).length;
	const lowStockItemsCount = items.filter(
		item => Number(item.quantity) < 10
	).length;

	// Calculate total revenue
	const totalRevenue = bills.reduce(
		(sum, bill) => sum + Number(bill.totalAmount),
		0
	);

	useEffect(() => {
		// Fetch all data needed for the dashboard
		dispatch(fetchItems());
		dispatch(fetchOrders());
		dispatch(fetchBills());
		dispatch(
			fetchDailySales({
				startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
				endDate: new Date().toISOString()
			})
		);
	}, [dispatch]);

	return (
		<div className='flex flex-col min-h-screen'>
			<header className='sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6'>
				<div className='flex flex-1 items-center justify-between'>
					<h1 className='text-xl font-semibold'>Dashboard</h1>
				</div>
			</header>
			<main className='flex-1 p-6'>
				<div className='space-y-8'>
					<div>
						<h2 className='text-2xl font-bold tracking-tight'>Overview</h2>
						<p className='text-muted-foreground'>
							Welcome to your store&apos;s performance at a glance.
						</p>
					</div>

					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
						<MetricsCard
							title='Total Revenue'
							value={`$${totalRevenue.toFixed(2)}`}
							icon={<DollarSign className='h-4 w-4' />}
							description='Lifetime revenue'
						/>
						<MetricsCard
							title='Total Orders'
							value={orders.length}
							icon={<ShoppingCart className='h-4 w-4' />}
							description='All time orders'
						/>
						<MetricsCard
							title='Items in Inventory'
							value={items.length}
							icon={<ShoppingBag className='h-4 w-4' />}
							description='Total unique items'
						/>
						<MetricsCard
							title='Total Bills'
							value={bills.length}
							icon={<Receipt className='h-4 w-4' />}
							description='Bills generated'
						/>
					</div>

					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									Recent Orders
								</CardTitle>
								<ShoppingCart className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{pendingOrdersCount}</div>
								<p className='text-xs text-muted-foreground'>
									{pendingOrdersCount === 1 ? 'Order' : 'Orders'} pending
								</p>
							</CardContent>
							<CardFooter>
								<Link href='/orders' passHref>
									<Button variant='ghost' className='w-full' size='sm'>
										<span>View all orders</span>
										<ArrowRight className='ml-2 h-4 w-4' />
									</Button>
								</Link>
							</CardFooter>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									Inventory Alert
								</CardTitle>
								<ShoppingBag className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{lowStockItemsCount}</div>
								<p className='text-xs text-muted-foreground'>
									{lowStockItemsCount === 1 ? 'Item' : 'Items'} low in stock
								</p>
							</CardContent>
							<CardFooter>
								<Link href='/items' passHref>
									<Button variant='ghost' className='w-full' size='sm'>
										<span>Manage inventory</span>
										<ArrowRight className='ml-2 h-4 w-4' />
									</Button>
								</Link>
							</CardFooter>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									Completed Orders
								</CardTitle>
								<Activity className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{completedOrdersCount}</div>
								<p className='text-xs text-muted-foreground'>
									Total completed orders
								</p>
							</CardContent>
							<CardFooter>
								<Link href='/analytics' passHref>
									<Button variant='ghost' className='w-full' size='sm'>
										<span>View analytics</span>
										<ArrowRight className='ml-2 h-4 w-4' />
									</Button>
								</Link>
							</CardFooter>
						</Card>
					</div>

					<div>
						<h2 className='text-xl font-bold tracking-tight mb-4'>
							Recent Sales
						</h2>
						<SalesChart />
					</div>
				</div>
			</main>
		</div>
	);
}
