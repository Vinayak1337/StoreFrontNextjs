'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { RootState } from '@/lib/redux/store';
import { fetchItems } from '@/lib/redux/slices/items.slice';
import { fetchOrders } from '@/lib/redux/slices/orders.slice';
import { fetchBills } from '@/lib/redux/slices/bills.slice';
import {
	fetchAnalyticsMetrics,
	fetchDailySales
} from '@/lib/redux/slices/analytics.slice';
import {
	BarChart3,
	DollarSign,
	Package,
	ShoppingCart,
	Users,
	CreditCard,
	ArrowRight,
	RefreshCw,
	Filter
} from 'lucide-react';
import Link from 'next/link';
import { RecentOrders } from '@/components/dashboard/recent-orders';

export default function DashboardContent() {
	const dispatch = useAppDispatch();
	const { items } = useAppSelector((state: RootState) => state.items);
	const { orders } = useAppSelector((state: RootState) => state.orders);
	const { bills } = useAppSelector((state: RootState) => state.bills);
	const { metrics, salesData, loading } = useAppSelector(
		(state: RootState) => state.analytics
	);

	// Local loading state
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Calculate 30 days range for analytics
	const getDateRange = () => {
		const endDate = new Date().toISOString().split('T')[0];
		const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
			.toISOString()
			.split('T')[0];
		return { startDate, endDate };
	};

	// Fetch all data on component mount
	useEffect(() => {
		dispatch(fetchItems());
		dispatch(fetchOrders());
		dispatch(fetchBills());

		const { startDate, endDate } = getDateRange();
		dispatch(fetchAnalyticsMetrics());
		dispatch(fetchDailySales({ startDate, endDate }));
	}, [dispatch]);

	// Handle refresh button click
	const handleRefresh = () => {
		setIsRefreshing(true);

		// Refetch all data
		dispatch(fetchItems());
		dispatch(fetchOrders());
		dispatch(fetchBills());

		const { startDate, endDate } = getDateRange();
		dispatch(fetchAnalyticsMetrics());
		dispatch(fetchDailySales({ startDate, endDate }));

		// Reset loading state after a short delay
		setTimeout(() => {
			setIsRefreshing(false);
		}, 1000);
	};

	// Calculate metrics
	const totalRevenue = metrics?.totalSales?.toFixed(2) || '0.00';
	const totalOrders = orders?.length || 0;
	const inventoryItems = items?.length || 0;
	const totalInvoices = bills?.length || 0;

	// Calculate percentages for comparison (defaulting to 0 if not available)
	const revenueChange = metrics?.conversionRate?.toFixed(1) || 0;
	const ordersChange =
		totalOrders > 0 ? ((metrics?.ordersTrend || 0) * 100).toFixed(1) : '0.0';
	const inventoryChange =
		items && items.length > 0
			? (
					(items.filter(item => item.quantity > 10).length / items.length) *
						100 -
					50
			  ).toFixed(1)
			: '0.0';
	const invoicesChange = 7.8; // This could be calculated if we have historical data

	return (
		<div className='flex flex-col space-y-6'>
			{/* Welcome section */}
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-up'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
					<p className='text-muted-foreground mt-1.5'>
						Welcome back! Here&apos;s what&apos;s happening with your store
						today.
					</p>
				</div>

				<div className='flex items-center gap-2'>
					<button
						className='inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background bg-muted hover:bg-muted/80'
						onClick={handleRefresh}
						disabled={isRefreshing || loading}>
						<RefreshCw
							className={`h-4 w-4 mr-2 ${
								isRefreshing || loading ? 'animate-spin' : ''
							}`}
						/>
						{isRefreshing ? 'Refreshing...' : 'Refresh'}
					</button>

					<button className='inline-flex items-center justify-center rounded-md w-9 h-9 bg-muted hover:bg-muted/80'>
						<Filter className='h-4 w-4' />
					</button>
				</div>
			</div>

			{/* Main metrics grid */}
			<div className='grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4'>
				{/* Revenue Card */}
				<div className='rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all'>
					<div className='p-6 flex flex-col space-y-2'>
						<div className='flex justify-between items-start'>
							<span className='text-sm font-medium text-muted-foreground'>
								Total Revenue
							</span>
							<div className='p-2 rounded-full bg-primary/10'>
								<DollarSign className='h-4 w-4 text-primary' />
							</div>
						</div>
						<div className='text-2xl font-bold'>
							{loading ? (
								<div className='h-8 bg-muted/50 rounded animate-pulse w-32'></div>
							) : (
								`$${totalRevenue}`
							)}
						</div>
						<div className='flex items-center text-xs'>
							<span
								className={`flex items-center gap-0.5 ${
									Number(revenueChange) >= 0 ? 'text-green-500' : 'text-red-500'
								}`}>
								<svg
									width='12'
									height='12'
									viewBox='0 0 24 24'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'>
									<path
										d={
											Number(revenueChange) >= 0
												? 'M12 19V5M5 12L12 5L19 12'
												: 'M12 5V19M5 12L12 19L19 12'
										}
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								</svg>
								{Number(revenueChange) >= 0 ? '+' : ''}
								{revenueChange}%
							</span>
							<span className='text-muted-foreground ml-1.5'>
								conversion rate
							</span>
						</div>
					</div>
				</div>

				{/* Orders Card */}
				<div className='rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all'>
					<div className='p-6 flex flex-col space-y-2'>
						<div className='flex justify-between items-start'>
							<span className='text-sm font-medium text-muted-foreground'>
								Total Orders
							</span>
							<div className='p-2 rounded-full bg-blue-500/10'>
								<ShoppingCart className='h-4 w-4 text-blue-500' />
							</div>
						</div>
						<div className='text-2xl font-bold'>
							{loading ? (
								<div className='h-8 bg-muted/50 rounded animate-pulse w-16'></div>
							) : (
								totalOrders
							)}
						</div>
						<div className='flex items-center text-xs'>
							<span
								className={`flex items-center gap-0.5 ${
									Number(ordersChange) >= 0 ? 'text-green-500' : 'text-red-500'
								}`}>
								<svg
									width='12'
									height='12'
									viewBox='0 0 24 24'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'>
									<path
										d={
											Number(ordersChange) >= 0
												? 'M12 19V5M5 12L12 5L19 12'
												: 'M12 5V19M5 12L12 19L19 12'
										}
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								</svg>
								{Number(ordersChange) >= 0 ? '+' : ''}
								{ordersChange}%
							</span>
							<span className='text-muted-foreground ml-1.5'>
								completion rate
							</span>
						</div>
					</div>
				</div>

				{/* Inventory Card */}
				<div className='rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all'>
					<div className='p-6 flex flex-col space-y-2'>
						<div className='flex justify-between items-start'>
							<span className='text-sm font-medium text-muted-foreground'>
								Inventory Items
							</span>
							<div className='p-2 rounded-full bg-indigo-500/10'>
								<Package className='h-4 w-4 text-indigo-500' />
							</div>
						</div>
						<div className='text-2xl font-bold'>
							{loading ? (
								<div className='h-8 bg-muted/50 rounded animate-pulse w-16'></div>
							) : (
								inventoryItems
							)}
						</div>
						<div className='flex items-center text-xs'>
							<span
								className={`flex items-center gap-0.5 ${
									Number(inventoryChange) >= 0
										? 'text-green-500'
										: 'text-red-500'
								}`}>
								<svg
									width='12'
									height='12'
									viewBox='0 0 24 24'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'>
									<path
										d={
											Number(inventoryChange) >= 0
												? 'M12 19V5M5 12L12 5L19 12'
												: 'M12 5V19M5 12L12 19L19 12'
										}
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								</svg>
								{Number(inventoryChange) >= 0 ? '+' : ''}
								{inventoryChange}%
							</span>
							<span className='text-muted-foreground ml-1.5'>stock level</span>
						</div>
					</div>
				</div>

				{/* Invoices Card */}
				<div className='rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all'>
					<div className='p-6 flex flex-col space-y-2'>
						<div className='flex justify-between items-start'>
							<span className='text-sm font-medium text-muted-foreground'>
								Total Invoices
							</span>
							<div className='p-2 rounded-full bg-orange-500/10'>
								<CreditCard className='h-4 w-4 text-orange-500' />
							</div>
						</div>
						<div className='text-2xl font-bold'>
							{loading ? (
								<div className='h-8 bg-muted/50 rounded animate-pulse w-16'></div>
							) : (
								totalInvoices
							)}
						</div>
						<div className='flex items-center text-xs'>
							<span className='text-green-500 flex items-center gap-0.5'>
								<svg
									width='12'
									height='12'
									viewBox='0 0 24 24'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'>
									<path
										d='M12 19V5M5 12L12 5L19 12'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									/>
								</svg>
								+{invoicesChange}%
							</span>
							<span className='text-muted-foreground ml-1.5'>
								from last period
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Recent activity and charts section */}
			<div className='grid gap-6 md:grid-cols-7'>
				{/* Chart area */}
				<div className='md:col-span-5 rounded-xl border bg-card text-card-foreground shadow-sm'>
					<div className='p-6'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-lg font-medium'>Sales Overview</h3>
							<Link
								href='/analytics'
								className='inline-flex items-center text-sm text-blue-500 hover:text-blue-700'>
								View detailed report
								<ArrowRight className='h-4 w-4 ml-1' />
							</Link>
						</div>
						{loading || !salesData?.dailySales ? (
							<div className='h-[300px] flex items-center justify-center bg-muted/30 rounded-lg animate-pulse'>
								<p className='text-muted-foreground text-sm'>
									Loading sales data...
								</p>
							</div>
						) : salesData.dailySales.length === 0 ? (
							<div className='h-[300px] flex items-center justify-center bg-muted/30 rounded-lg'>
								<p className='text-muted-foreground text-sm'>
									No sales data available for the selected period
								</p>
							</div>
						) : (
							<div className='h-[300px] flex items-center justify-center bg-muted/30 rounded-lg'>
								<p className='text-muted-foreground text-sm'>
									{salesData.dailySales.length} days of sales data loaded
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Activity stats */}
				<div className='md:col-span-2 rounded-xl border bg-card text-card-foreground shadow-sm'>
					<div className='p-6'>
						<h3 className='text-lg font-medium mb-4'>Activity</h3>

						{loading ? (
							// Loading skeleton
							<div className='space-y-4'>
								{[...Array(4)].map((_, i) => (
									<div key={i} className='flex items-center justify-between'>
										<div className='flex items-center gap-2'>
											<div className='w-2 h-2 rounded-full bg-muted'></div>
											<div className='h-4 w-24 bg-muted/50 rounded animate-pulse'></div>
										</div>
										<div className='h-4 w-16 bg-muted/50 rounded animate-pulse'></div>
									</div>
								))}
							</div>
						) : (
							<div className='space-y-4'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<div className='w-2 h-2 rounded-full bg-primary'></div>
										<span className='text-sm font-medium'>New Orders</span>
									</div>
									<div className='font-bold'>
										{orders.filter(order => order.status === 'PENDING').length}
									</div>
								</div>

								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<div className='w-2 h-2 rounded-full bg-blue-500'></div>
										<span className='text-sm font-medium'>Items Sold</span>
									</div>
									<div className='font-bold'>
										{orders.reduce(
											(total, order) =>
												total +
												order.orderItems.reduce(
													(sum, item) => sum + item.quantity,
													0
												),
											0
										)}
									</div>
								</div>

								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<div className='w-2 h-2 rounded-full bg-green-500'></div>
										<span className='text-sm font-medium'>Revenue</span>
									</div>
									<div className='font-bold'>${totalRevenue}</div>
								</div>

								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<div className='w-2 h-2 rounded-full bg-orange-500'></div>
										<span className='text-sm font-medium'>Low Stock</span>
									</div>
									<div className='font-bold'>
										{items.filter(item => item.quantity < 10).length}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Recent Orders */}
			<RecentOrders limit={5} variant='glass' />

			{/* Quick actions */}
			<div className='grid gap-5 md:grid-cols-4'>
				<Link
					href='/orders/new'
					className='group rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition-all'>
					<div className='flex flex-col items-center text-center space-y-2'>
						<div className='p-3 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors'>
							<ShoppingCart className='h-6 w-6 text-blue-500' />
						</div>
						<h3 className='font-medium'>New Order</h3>
						<p className='text-sm text-muted-foreground'>
							Create a new customer order
						</p>
					</div>
				</Link>

				<Link
					href='/items/new'
					className='group rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition-all'>
					<div className='flex flex-col items-center text-center space-y-2'>
						<div className='p-3 bg-indigo-500/10 rounded-full group-hover:bg-indigo-500/20 transition-colors'>
							<Package className='h-6 w-6 text-indigo-500' />
						</div>
						<h3 className='font-medium'>Add Product</h3>
						<p className='text-sm text-muted-foreground'>
							Add a new product to inventory
						</p>
					</div>
				</Link>

				<Link
					href='/customers'
					className='group rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition-all'>
					<div className='flex flex-col items-center text-center space-y-2'>
						<div className='p-3 bg-green-500/10 rounded-full group-hover:bg-green-500/20 transition-colors'>
							<Users className='h-6 w-6 text-green-500' />
						</div>
						<h3 className='font-medium'>Customers</h3>
						<p className='text-sm text-muted-foreground'>
							Manage your customer database
						</p>
					</div>
				</Link>

				<Link
					href='/settings'
					className='group rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition-all'>
					<div className='flex flex-col items-center text-center space-y-2'>
						<div className='p-3 bg-orange-500/10 rounded-full group-hover:bg-orange-500/20 transition-colors'>
							<BarChart3 className='h-6 w-6 text-orange-500' />
						</div>
						<h3 className='font-medium'>Reports</h3>
						<p className='text-sm text-muted-foreground'>
							View analytics and reports
						</p>
					</div>
				</Link>
			</div>
		</div>
	);
}
