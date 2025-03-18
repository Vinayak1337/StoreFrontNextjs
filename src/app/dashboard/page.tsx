'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import {
	Activity,
	DollarSign,
	Receipt,
	ShoppingCart,
	ArrowRight,
	TrendingUp,
	AlertCircle,
	Package,
	BarChart,
	Calendar
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
import { SearchInput } from '@/components/ui/input';

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
		<div className='flex flex-col min-h-screen animate-fade-in'>
			<header className='sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-6'>
				<div className='flex flex-1 items-center justify-between'>
					<h1 className='text-xl font-semibold flex items-center'>
						<BarChart className='h-5 w-5 mr-2 text-primary' />
						<span className='text-gradient'>Dashboard</span>
					</h1>
					<div className='flex items-center gap-4'>
						<SearchInput placeholder='Search...' className='w-60' />
						<Button size='sm' variant='outline'>
							<Calendar className='h-4 w-4 mr-2' />
							Today
						</Button>
					</div>
				</div>
			</header>
			<main className='flex-1 p-6'>
				<div className='space-y-8'>
					<div className='animate-slide-in' style={{ animationDelay: '0.1s' }}>
						<h2 className='text-2xl font-bold tracking-tight'>Overview</h2>
						<p className='text-muted-foreground'>
							Welcome to your store&apos;s performance at a glance.
						</p>
					</div>

					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
						<div
							className='animate-slide-in'
							style={{ animationDelay: '0.2s' }}>
							<MetricsCard
								title='Total Revenue'
								value={`$${totalRevenue.toFixed(2)}`}
								icon={<DollarSign className='h-5 w-5 text-emerald-500' />}
								description='Lifetime revenue'
								trend='+12.5% from last month'
								trendIcon={<TrendingUp className='h-4 w-4 text-emerald-500' />}
							/>
						</div>
						<div
							className='animate-slide-in'
							style={{ animationDelay: '0.3s' }}>
							<MetricsCard
								title='Total Orders'
								value={orders.length}
								icon={<ShoppingCart className='h-5 w-5 text-blue-500' />}
								description='All time orders'
								trend='+5.2% from last week'
								trendIcon={<TrendingUp className='h-4 w-4 text-blue-500' />}
							/>
						</div>
						<div
							className='animate-slide-in'
							style={{ animationDelay: '0.4s' }}>
							<MetricsCard
								title='Items in Inventory'
								value={items.length}
								icon={<Package className='h-5 w-5 text-purple-500' />}
								description='Total unique items'
							/>
						</div>
						<div
							className='animate-slide-in'
							style={{ animationDelay: '0.5s' }}>
							<MetricsCard
								title='Total Bills'
								value={bills.length}
								icon={<Receipt className='h-5 w-5 text-amber-500' />}
								description='Bills generated'
							/>
						</div>
					</div>

					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
						<div
							className='animate-slide-in'
							style={{ animationDelay: '0.6s' }}>
							<Card variant='interactive'>
								<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
									<CardTitle
										icon={<ShoppingCart className='h-4 w-4 text-blue-500' />}>
										Recent Orders
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='text-3xl font-bold'>{pendingOrdersCount}</div>
									<p className='text-sm text-muted-foreground'>
										{pendingOrdersCount === 1 ? 'Order' : 'Orders'} pending
									</p>
								</CardContent>
								<CardFooter>
									<Link href='/orders' passHref>
										<Button
											variant='gradient'
											className='w-full'
											size='sm'
											rightIcon={<ArrowRight className='h-4 w-4' />}>
											View all orders
										</Button>
									</Link>
								</CardFooter>
							</Card>
						</div>

						<div
							className='animate-slide-in'
							style={{ animationDelay: '0.7s' }}>
							<Card variant='interactive'>
								<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
									<CardTitle
										icon={<AlertCircle className='h-4 w-4 text-destructive' />}>
										Inventory Alert
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='text-3xl font-bold'>{lowStockItemsCount}</div>
									<p className='text-sm text-muted-foreground'>
										{lowStockItemsCount === 1 ? 'Item' : 'Items'} low in stock
									</p>
								</CardContent>
								<CardFooter>
									<Link href='/items' passHref>
										<Button
											variant='outline'
											className='w-full'
											size='sm'
											rightIcon={<ArrowRight className='h-4 w-4' />}>
											Manage inventory
										</Button>
									</Link>
								</CardFooter>
							</Card>
						</div>

						<div
							className='animate-slide-in'
							style={{ animationDelay: '0.8s' }}>
							<Card variant='interactive'>
								<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
									<CardTitle
										icon={<Activity className='h-4 w-4 text-emerald-500' />}>
										Completed Orders
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='text-3xl font-bold'>
										{completedOrdersCount}
									</div>
									<p className='text-sm text-muted-foreground'>
										Total completed orders
									</p>
								</CardContent>
								<CardFooter>
									<Link href='/analytics' passHref>
										<Button
											variant='outline'
											className='w-full'
											size='sm'
											rightIcon={<ArrowRight className='h-4 w-4' />}>
											View analytics
										</Button>
									</Link>
								</CardFooter>
							</Card>
						</div>
					</div>

					<div className='animate-slide-in' style={{ animationDelay: '0.9s' }}>
						<Card variant='outline' className='p-4'>
							<CardHeader>
								<CardTitle icon={<BarChart className='h-5 w-5 text-primary' />}>
									Recent Sales
								</CardTitle>
							</CardHeader>
							<CardContent>
								<SalesChart />
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
