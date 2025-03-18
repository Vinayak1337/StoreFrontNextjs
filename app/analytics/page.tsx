'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	ShoppingCartIcon,
	DollarSignIcon,
	ReceiptIcon,
	BarChartIcon
} from 'lucide-react';
import { SalesChart } from '@/components/analytics/sales-chart';
import { MetricsCard } from '@/components/analytics/metrics-card';
import {
	fetchDailySales,
	fetchAnalyticsMetrics
} from '@/lib/redux/slices/analytics.slice';
import { RootState } from '@/lib/redux/store';

export default function AnalyticsPage() {
	const dispatch = useDispatch();
	const { salesData, metrics, loading, error } = useSelector(
		(state: RootState) => state.analytics
	);

	useEffect(() => {
		// Fetch sales data and metrics when component mounts
		dispatch(
			fetchDailySales({
				startDate: new Date(
					Date.now() - 14 * 24 * 60 * 60 * 1000
				).toISOString(), // 14 days ago
				endDate: new Date().toISOString()
			})
		);
		dispatch(fetchAnalyticsMetrics());
	}, [dispatch]);

	// Calculate total sales from daily sales data
	const calculateTotalSales = () => {
		if (!salesData || !salesData.dailySales) return 0;

		return salesData.dailySales.reduce(
			(sum, day) => sum + Number(day.totalSales),
			0
		);
	};

	const totalSales = calculateTotalSales();

	return (
		<div className='flex flex-col min-h-screen'>
			<header className='sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6'>
				<div className='flex flex-1 items-center justify-between'>
					<h1 className='text-xl font-semibold'>Analytics Dashboard</h1>
				</div>
			</header>
			<main className='flex-1 p-6'>
				<div className='space-y-6'>
					<h2 className='text-2xl font-bold tracking-tight'>Overview</h2>

					{error && (
						<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
							<p>Error: {error}</p>
						</div>
					)}

					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
						<MetricsCard
							title='Total Revenue'
							value={`$${totalSales.toFixed(2)}`}
							icon={<DollarSignIcon className='h-4 w-4' />}
							change={metrics?.revenueTrend || 0}
							description='vs last period'
						/>
						<MetricsCard
							title='Total Orders'
							value={metrics?.totalOrders || 0}
							icon={<ShoppingCartIcon className='h-4 w-4' />}
							change={metrics?.ordersTrend || 0}
							description='vs last period'
						/>
						<MetricsCard
							title='Average Order Value'
							value={`$${metrics?.averageOrderValue?.toFixed(2) || '0.00'}`}
							icon={<ReceiptIcon className='h-4 w-4' />}
							description='per order'
						/>
						<MetricsCard
							title='Conversion Rate'
							value={`${metrics?.conversionRate?.toFixed(1) || '0.0'}%`}
							icon={<BarChartIcon className='h-4 w-4' />}
							change={metrics?.conversionTrend || 0}
							description='vs last period'
						/>
					</div>

					<div className='grid gap-4 grid-cols-1'>
						<SalesChart />
					</div>

					{loading && (
						<div className='flex justify-center items-center py-8'>
							<p className='text-muted-foreground'>Loading analytics data...</p>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
