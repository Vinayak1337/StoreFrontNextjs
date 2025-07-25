'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { RootState } from '@/lib/redux/store';
import { fetchItems } from '@/lib/redux/slices/items.slice';
import { fetchOrders } from '@/lib/redux/slices/orders.slice';
import {
	fetchAnalyticsMetrics,
	fetchDailySales
} from '@/lib/redux/slices/analytics.slice';
import {
	BarChart3,
	DollarSign,
	Package,
	ShoppingCart,
	ArrowRight,
	RefreshCw,
	Filter,
	Plus,
	TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { MetricCard } from '@/components/dashboard/metric-card';

export default function DashboardContent() {
	const dispatch = useAppDispatch();
	const { items } = useAppSelector((state: RootState) => state.items);
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

		const { startDate, endDate } = getDateRange();
		dispatch(fetchAnalyticsMetrics());
		dispatch(fetchDailySales({ startDate, endDate }));

		// Reset loading state after a short delay
		setTimeout(() => {
			setIsRefreshing(false);
		}, 1000);
	};

	// Calculate metrics with proper data
	const totalRevenue = metrics?.totalSales?.toFixed(2) || '0.00';

	// Calculate proper trend percentages
	const revenueChange = metrics?.revenueTrend?.toFixed(1) || '0.0';
	const ordersChange = metrics?.ordersTrend?.toFixed(1) || '0.0';

	// Calculate items trend (in stock vs out of stock)
	const inStockItems = items?.filter(item => item.inStock)?.length || 0;
	const itemsChange =
		items && items.length > 0
			? ((inStockItems / items.length - 0.85) * 100).toFixed(1) // Compare against 85% target
			: '0.0';

	return (
		<div className='space-y-6'>
			{/* Welcome section */}
			<div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 animate-slide-up'>
				<div className='min-w-0 flex-1'>
					<h1 className='text-2xl md:text-3xl font-bold text-gray-900 tracking-tight'>
						Dashboard
					</h1>
					<p className='text-gray-600 mt-1.5 text-sm md:text-base'>
						Welcome back! Here&apos;s what&apos;s happening with your store
						today.
					</p>
				</div>

				<div className='flex items-center gap-3 w-full lg:w-auto'>
					<button
						onClick={handleRefresh}
						disabled={isRefreshing || loading}
						className='flex-1 lg:flex-none inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50'>
						<RefreshCw
							className={`h-4 w-4 mr-2 ${
								isRefreshing || loading ? 'animate-spin' : ''
							}`}
						/>
						{isRefreshing ? 'Refreshing...' : 'Refresh'}
					</button>

					<button className='flex-shrink-0 inline-flex items-center justify-center rounded-lg w-10 h-10 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors'>
						<Filter className='h-4 w-4' />
					</button>
				</div>
			</div>

			{/* Main metrics grid - Enhanced responsive design */}
			<div
				className='grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 animate-slide-up'
				style={{ animationDelay: '100ms' }}>
				<MetricCard
					title='Total Revenue'
					value={`₹${totalRevenue}`}
					change={revenueChange}
					icon={DollarSign}
					iconColor='bg-green-100 text-green-600'
					loading={loading}
					description='vs last period'
				/>

				<MetricCard
					title='Total Orders'
					value={metrics?.totalOrders || 0}
					change={ordersChange}
					icon={ShoppingCart}
					iconColor='bg-emerald-100 text-emerald-600'
					loading={loading}
					description='all time orders'
				/>

				<MetricCard
					title='Printed Orders'
					value={metrics?.printedOrders || 0}
					change={
						metrics?.printRate ? `${metrics.printRate.toFixed(1)}%` : '0%'
					}
					icon={Package}
					iconColor='bg-emerald-100 text-emerald-600'
					loading={loading}
					description='print rate'
				/>

				<MetricCard
					title='Items in Stock'
					value={inStockItems || 0}
					change={itemsChange}
					icon={Package}
					iconColor='bg-orange-100 text-orange-600'
					loading={loading}
					description='inventory items'
				/>
			</div>

			{/* Quick actions bar */}
			<div
				className='flex flex-wrap gap-3 animate-slide-up'
				style={{ animationDelay: '200ms' }}>
				<Link
					href='/orders/create'
					className='flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm'>
					<Plus className='h-4 w-4' />
					New Order
				</Link>
				<Link
					href='/items/create'
					className='flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium'>
					<Package className='h-4 w-4' />
					Add Item
				</Link>
				<Link
					href='/analytics'
					className='flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium'>
					<BarChart3 className='h-4 w-4' />
					View Analytics
				</Link>
			</div>

			{/* Dashboard content grid - Charts and Recent Activity */}
			<div
				className='grid gap-6 grid-cols-1 xl:grid-cols-7 animate-slide-up'
				style={{ animationDelay: '300ms' }}>
				{/* Chart area */}
				<div className='xl:col-span-5'>
					<div className='bg-white rounded-xl border shadow-sm p-6'>
						<div className='flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3'>
							<h3 className='text-lg font-semibold text-gray-900'>
								Sales Overview
							</h3>
							<Link
								href='/analytics'
								className='inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700 transition-colors font-medium'>
								View detailed report
								<ArrowRight className='h-4 w-4 ml-1' />
							</Link>
						</div>

						{loading || !salesData?.dailySales ? (
							<div className='h-80 flex items-center justify-center bg-gray-50 rounded-lg'>
								<div className='text-center'>
									<div className='animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4'></div>
									<p className='text-gray-600 text-sm'>Loading sales data...</p>
								</div>
							</div>
						) : salesData.dailySales.length === 0 ? (
							<div className='h-80 flex items-center justify-center bg-gray-50 rounded-lg'>
								<div className='text-center'>
									<TrendingUp className='h-12 w-12 text-gray-400 mx-auto mb-4' />
									<h4 className='text-lg font-medium text-gray-900 mb-2'>
										No Sales Data
									</h4>
									<p className='text-gray-600 text-sm'>
										No sales data available for the selected period
									</p>
								</div>
							</div>
						) : (
							<div className='h-80 flex items-center justify-center bg-gray-50 rounded-lg'>
								<div className='text-center'>
									<BarChart3 className='h-12 w-12 text-emerald-600 mx-auto mb-4' />
									<h4 className='text-lg font-medium text-gray-900 mb-2'>
										Chart Coming Soon
									</h4>
									<p className='text-gray-600 text-sm'>
										{salesData.dailySales.length} days of sales data ready for
										visualization
									</p>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Activity sidebar */}
				<div className='xl:col-span-2'>
					<div className='bg-white rounded-xl border shadow-sm p-6'>
						<h3 className='text-lg font-semibold text-gray-900 mb-6'>
							Quick Stats
						</h3>

						<div className='space-y-4'>
							{/* Total Orders Summary */}
							{metrics && (
								<div className='p-4 bg-emerald-50 border border-emerald-200 rounded-lg'>
									<div className='flex items-center justify-between mb-2'>
										<h4 className='text-sm font-medium text-emerald-800'>
											All Orders
										</h4>
										<ShoppingCart className='h-5 w-5 text-emerald-600' />
									</div>
									<div className='space-y-1 text-xs text-emerald-600'>
										<div className='flex justify-between'>
											<span>Total Orders:</span>
											<span className='font-medium'>{metrics.totalOrders}</span>
										</div>
										<div className='flex justify-between'>
											<span>Avg Order Value:</span>
											<span className='font-medium'>
												₹{metrics.averageOrderValue?.toFixed(2) || '0.00'}
											</span>
										</div>
									</div>
								</div>
							)}

							{/* Print Status Breakdown */}
							{metrics?.printStatusBreakdown && (
								<div className='p-4 bg-emerald-50 border border-emerald-200 rounded-lg'>
									<div className='flex items-center justify-between mb-2'>
										<h4 className='text-sm font-medium text-emerald-800'>
											Print Status
										</h4>
										<Package className='h-5 w-5 text-emerald-600' />
									</div>
									<div className='space-y-1 text-xs text-emerald-600'>
										<div className='flex justify-between'>
											<span>Printed:</span>
											<span className='font-medium'>
												{metrics.printStatusBreakdown.printed}
											</span>
										</div>
										<div className='flex justify-between'>
											<span>Unprinted:</span>
											<span className='font-medium'>
												{metrics.printStatusBreakdown.unprinted}
											</span>
										</div>
									</div>
								</div>
							)}

							{/* Low Stock Alert */}
							{items && items.filter(item => !item.inStock).length > 0 && (
								<div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
									<div className='flex items-center justify-between'>
										<div>
											<h4 className='text-sm font-medium text-red-800'>
												Low Stock Alert
											</h4>
											<p className='text-xs text-red-600 mt-1'>
												{items.filter(item => !item.inStock).length} items out
												of stock
											</p>
										</div>
										<Package className='h-5 w-5 text-red-600' />
									</div>
								</div>
							)}

							{/* Revenue Growth */}
							<div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
								<div className='flex items-center justify-between'>
									<div>
										<h4 className='text-sm font-medium text-green-800'>
											Revenue Growth
										</h4>
										<p className='text-xs text-green-600 mt-1'>
											{Number(revenueChange) >= 0 ? '+' : ''}
											{revenueChange}% vs last period
										</p>
									</div>
									<TrendingUp className='h-5 w-5 text-green-600' />
								</div>
							</div>
						</div>

						{/* Quick Actions */}
						<div className='mt-6 pt-6 border-t'>
							<h4 className='text-sm font-medium text-gray-900 mb-3'>
								Quick Actions
							</h4>
							<div className='space-y-2'>
								<Link
									href='/orders'
									className='block text-sm text-gray-600 hover:text-gray-900 transition-colors py-1'>
									View all orders
								</Link>
								<Link
									href='/items'
									className='block text-sm text-gray-600 hover:text-gray-900 transition-colors py-1'>
									Manage inventory
								</Link>
								<Link
									href='/settings'
									className='block text-sm text-gray-600 hover:text-gray-900 transition-colors py-1'>
									Store settings
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Recent Orders */}
			<div className='animate-slide-up' style={{ animationDelay: '400ms' }}>
				<RecentOrders />
			</div>
		</div>
	);
}
