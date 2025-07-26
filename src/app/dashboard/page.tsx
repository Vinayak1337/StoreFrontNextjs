import { getItems } from '../api/items/route';
import { getOrders } from '../api/orders/route';
import { getAnalyticsMetrics } from '../api/analytics/metrics/route';
import { getDailySales } from '../api/analytics/daily-sales/route';
import Link from 'next/link';
import {
	BarChart3,
	DollarSign,
	Package,
	ShoppingCart,
	Plus,
	TrendingUp
} from 'lucide-react';
import { RefreshButton } from '@/components/dashboard/refresh-button';
import { cache } from 'react';

// Cached functions for better performance
const getCachedItems = cache(async () => {
	const { items } = await getItems(0, 0); // Get all items without pagination
	return items;
});

const getCachedOrders = cache(async () => {
	return await getOrders();
});

const getCachedAnalyticsMetrics = cache(async () => {
	return await getAnalyticsMetrics();
});

const getCachedDailySales = cache(async () => {
	const endDate = new Date().toISOString().split('T')[0];
	const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		.toISOString()
		.split('T')[0];
	return await getDailySales(startDate, endDate);
});

function MetricCard({
	title,
	value,
	change,
	icon: Icon,
	iconColor
}: {
	title: string;
	value: string;
	change: string;
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	iconColor: string;
}) {
	const changeNum = Number(change.replace('%', ''));
	const isPositive = changeNum >= 0;

	return (
		<div className='bg-white rounded-xl border border-gray-200 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<p className='text-sm font-medium text-gray-600'>{title}</p>
					<p className='text-2xl font-bold text-gray-900 mt-2'>{value}</p>
				</div>
				<div
					className={`p-3 rounded-lg ${
						'bg-emerald-100'
					}`}>
					<Icon className={`h-6 w-6 ${iconColor}`} />
				</div>
			</div>
			<div className='mt-4 flex items-center'>
				<TrendingUp
					className={`h-4 w-4 mr-1 ${
						isPositive ? 'text-green-500' : 'text-red-500'
					}`}
				/>
				<span
					className={`text-sm font-medium ${
						isPositive ? 'text-green-600' : 'text-red-600'
					}`}>
					{change}
				</span>
				<span className='text-gray-500 text-sm ml-1'>vs last period</span>
			</div>
		</div>
	);
}

export default async function DashboardPage() {
	// Fetch all dashboard data server-side
	const [items, orders, metrics, dailySales] = await Promise.all([
		getCachedItems(),
		getCachedOrders(),
		getCachedAnalyticsMetrics(),
		getCachedDailySales()
	]);

	// Calculate metrics with proper data
	const totalRevenue = metrics?.totalSales?.toFixed(2) || '0.00';
	const revenueChange = metrics?.revenueTrend?.toFixed(1) || '0.0';
	const ordersChange = metrics?.ordersTrend?.toFixed(1) || '0.0';

	// Calculate items trend (in stock vs out of stock)
	const inStockItems =
		items?.filter((item: { inStock: boolean }) => item.inStock)?.length || 0;
	const itemsChange =
		items && items.length > 0
			? ((inStockItems / items.length - 0.85) * 100).toFixed(1)
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

				<div className='flex items-center gap-3'>
					<RefreshButton />
					<Link
						href='/orders/new'
						className='inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors'>
						<Plus className='h-4 w-4' />
						New Order
					</Link>
				</div>
			</div>

			{/* Metrics Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'>
				<MetricCard
					title='Total Revenue'
					value={`₹${totalRevenue}`}
					change={`${revenueChange}%`}
					icon={DollarSign}
					iconColor='text-emerald-600'
				/>

				<MetricCard
					title='Total Orders'
					value={metrics?.totalOrders?.toString() || '0'}
					change={`${ordersChange}%`}
					icon={ShoppingCart}
					iconColor='text-emerald-600'
				/>

				<MetricCard
					title='Items in Stock'
					value={inStockItems.toString()}
					change={`${itemsChange}%`}
					icon={Package}
					iconColor='text-emerald-600'
				/>

				<MetricCard
					title='Conversion Rate'
					value={`${metrics?.conversionRate?.toFixed(1) || '0.0'}%`}
					change={`${metrics?.conversionTrend?.toFixed(1) || '0.0'}%`}
					icon={TrendingUp}
					iconColor='text-emerald-600'
				/>
			</div>

			{/* Charts and Recent Activity */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Sales Chart */}
				<div className='lg:col-span-2'>
					<div className='bg-white rounded-xl border border-gray-200 p-6'>
						<div className='flex items-center justify-between mb-6'>
							<div>
								<h3 className='text-lg font-semibold text-gray-900'>
									Sales Overview
								</h3>
								<p className='text-sm text-gray-600 mt-1'>
									Daily sales for the last 30 days
								</p>
							</div>
							<div className='flex items-center gap-2 text-sm text-gray-600'>
								<BarChart3 className='h-4 w-4' />
								<span>Last 30 days</span>
							</div>
						</div>

						{/* Simple chart placeholder */}
						<div className='h-64 bg-gray-50 rounded-lg flex items-center justify-center'>
							<div className='text-center'>
								<BarChart3 className='h-12 w-12 text-gray-400 mx-auto mb-2' />
								<p className='text-gray-600'>Sales Chart</p>
								<p className='text-sm text-gray-500'>
									{dailySales?.length || 0} data points
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Recent Orders */}
				<div className='lg:col-span-1'>
					<div className='bg-white rounded-xl border border-gray-200 p-6'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-lg font-semibold text-gray-900'>
								Recent Orders
							</h3>
							<Link
								href='/orders'
								className='text-sm text-emerald-600 hover:text-emerald-800 font-medium'>
								View all
							</Link>
						</div>
						<div className='space-y-3'>
							{(orders || []).slice(0, 5).map((order: any) => (
								<div
									key={order.id}
									className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
									<div>
										<p className='font-medium text-gray-900'>
											{order.customerName}
										</p>
										<p className='text-sm text-gray-600'>
											{order.orderItems?.length || 0} items
										</p>
									</div>
									<div className='text-right'>
										<p className='font-medium text-gray-900'>
											₹{order.orderItems?.reduce((sum: number, item: any) => sum + (Number(item.price) * Number(item.quantity)), 0).toFixed(2) || '0.00'}
										</p>
										<p className='text-xs text-gray-500'>
											{new Date(order.createdAt).toLocaleDateString()}
										</p>
									</div>
								</div>
							))}
							{(!orders || orders.length === 0) && (
								<div className='text-center py-8 text-gray-500'>
									<ShoppingCart className='h-12 w-12 mx-auto mb-2 opacity-50' />
									<p>No orders yet</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className='bg-white rounded-xl border border-gray-200 p-6'>
				<h3 className='text-lg font-semibold text-gray-900 mb-4'>
					Quick Actions
				</h3>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
					<Link
						href='/orders/new'
						className='group p-4 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all'>
						<div className='flex items-center gap-3'>
							<div className='p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors'>
								<Plus className='h-5 w-5 text-emerald-600' />
							</div>
							<div>
								<h4 className='font-medium text-gray-900'>New Order</h4>
								<p className='text-sm text-gray-600'>Create order</p>
							</div>
						</div>
					</Link>

					<Link
						href='/items'
						className='group p-4 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all'>
						<div className='flex items-center gap-3'>
							<div className='p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors'>
								<Package className='h-5 w-5 text-emerald-600' />
							</div>
							<div>
								<h4 className='font-medium text-gray-900'>Manage Items</h4>
								<p className='text-sm text-gray-600'>View inventory</p>
							</div>
						</div>
					</Link>

					<Link
						href='/orders'
						className='group p-4 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all'>
						<div className='flex items-center gap-3'>
							<div className='p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors'>
								<ShoppingCart className='h-5 w-5 text-emerald-600' />
							</div>
							<div>
								<h4 className='font-medium text-gray-900'>View Orders</h4>
								<p className='text-sm text-gray-600'>Order history</p>
							</div>
						</div>
					</Link>

					<Link
						href='/analytics'
						className='group p-4 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all'>
						<div className='flex items-center gap-3'>
							<div className='p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors'>
								<BarChart3 className='h-5 w-5 text-emerald-600' />
							</div>
							<div>
								<h4 className='font-medium text-gray-900'>Analytics</h4>
								<p className='text-sm text-gray-600'>View reports</p>
							</div>
						</div>
					</Link>
				</div>
			</div>
		</div>
	);
}
