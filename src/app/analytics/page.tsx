'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
	TrendingUp,
	TrendingDown,
	DollarSign,
	ShoppingCart,
	Receipt,
	BarChart3,
	Calendar,
	Filter,
	Download,
	RefreshCw
} from 'lucide-react';
import { SalesChart } from '@/components/analytics/sales-chart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	fetchDailySales,
	fetchAnalyticsMetrics
} from '@/lib/redux/slices/analytics.slice';
import { RootState } from '@/lib/redux/store';

export default function AnalyticsPage() {
	const dispatch = useAppDispatch();
	const { salesData, metrics, loading, error } = useAppSelector(
		(state: RootState) => state.analytics
	);
	const [refreshing, setRefreshing] = useState(false);

	const loadAnalyticsData = useCallback(async (days: number = 30) => {
		const endDate = new Date().toISOString();
		const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
		
		dispatch(
			fetchDailySales({
				startDate,
				endDate
			})
		);
		dispatch(fetchAnalyticsMetrics());
	}, [dispatch]);

	useEffect(() => {
		loadAnalyticsData();
	}, [loadAnalyticsData]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadAnalyticsData();
		setTimeout(() => setRefreshing(false), 1000);
	};

	// Calculate total sales from daily sales data
	const calculateTotalSales = () => {
		if (!salesData || !salesData.dailySales) return 0;
		return salesData.dailySales.reduce(
			(sum: number, day: { totalAmount?: number | string }) =>
				sum + Number(day.totalAmount || 0),
			0
		);
	};

	const totalSales = calculateTotalSales();

	// Enhanced metrics cards data
	const metricsCards = [
		{
			title: 'Total Revenue',
			value: `₹${(metrics?.totalSales || totalSales).toFixed(2)}`,
			icon: <DollarSign className='h-5 w-5' />,
			change: metrics?.revenueTrend || 0,
			subtitle: 'vs last period',
			color: 'text-green-600',
			bgColor: 'bg-green-100'
		},
		{
			title: 'Total Orders',
			value: (metrics?.totalOrders || 0).toString(),
			icon: <ShoppingCart className='h-5 w-5' />,
			change: metrics?.ordersTrend || 0,
			subtitle: `${metrics?.completedOrders || 0} completed`,
			color: 'text-blue-600',
			bgColor: 'bg-blue-100'
		},
		{
			title: 'Print Rate',
			value: `${(metrics?.printRate || 0).toFixed(1)}%`,
			icon: <Receipt className='h-5 w-5' />,
			change: metrics?.printedOrders || 0,
			subtitle: `${metrics?.printedOrders || 0} printed`,
			color: 'text-blue-600',
			bgColor: 'bg-blue-100'
		},
		{
			title: 'Average Order Value',
			value: `₹${(metrics?.averageOrderValue || 0).toFixed(2)}`,
			icon: <BarChart3 className='h-5 w-5' />,
			change: metrics?.conversionTrend || 0,
			subtitle: 'vs last period',
			color: 'text-orange-600',
			bgColor: 'bg-orange-100'
		}
	];

	if (loading && !refreshing) {
		return (
			<div className='flex items-center justify-center min-h-[500px]'>
				<div className='text-center'>
					<div className='animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4'></div>
					<p className='text-gray-600'>Loading analytics...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-4 lg:space-y-6 pb-4 lg:pb-6'>
			{/* Header */}
			<div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
				<div className='flex-1'>
					<h1 className='text-2xl lg:text-3xl font-bold text-gray-900'>
						Analytics Dashboard
					</h1>
					<p className='text-sm lg:text-base text-gray-600 mt-1'>
						Track your business performance and insights
					</p>
				</div>
				<div className='flex flex-wrap items-center gap-2 lg:gap-3'>
					<Button
						variant='outline'
						size='sm'
						onClick={handleRefresh}
						disabled={refreshing}
						className='gap-1 lg:gap-2 text-xs lg:text-sm'
					>
						<RefreshCw className={`h-3 w-3 lg:h-4 lg:w-4 ${refreshing ? 'animate-spin' : ''}`} />
						<span className='hidden sm:inline'>Refresh</span>
					</Button>
					<Button variant='outline' size='sm' className='gap-1 lg:gap-2 text-xs lg:text-sm'>
						<Download className='h-3 w-3 lg:h-4 lg:w-4' />
						<span className='hidden sm:inline'>Export</span>
					</Button>
					<Button variant='outline' size='sm' className='gap-1 lg:gap-2 text-xs lg:text-sm'>
						<Filter className='h-3 w-3 lg:h-4 lg:w-4' />
						<span className='hidden sm:inline'>Filter</span>
					</Button>
				</div>
			</div>

			{/* Error Display */}
			{error && (
				<div className='bg-red-50 border border-red-200 rounded-xl p-4'>
					<div className='flex items-center gap-2 text-red-700'>
						<div className='w-2 h-2 bg-red-500 rounded-full'></div>
						<p className='font-medium'>Error loading analytics</p>
					</div>
					<p className='text-red-600 text-sm mt-1'>{error}</p>
				</div>
			)}

			{/* Metrics Cards */}
			<div className='grid gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-4'>
				{metricsCards.map((card, index) => (
					<div 
						key={card.title}
						className='bg-white rounded-lg lg:rounded-xl border border-gray-200 p-4 lg:p-6 hover:shadow-md transition-all duration-200'
						style={{ animationDelay: `${index * 100}ms` }}
					>
						<div className='flex items-center justify-between mb-3 lg:mb-4'>
							<div className={`p-1.5 lg:p-2 rounded-md lg:rounded-lg ${card.bgColor}`}>
								<div className={card.color}>
									{card.icon}
								</div>
							</div>
							{card.change !== 0 && (
								<Badge 
									variant={card.change > 0 ? 'default' : 'destructive'}
									className='gap-0.5 lg:gap-1 text-xs px-1.5 lg:px-2'
								>
									{card.change > 0 ? (
										<TrendingUp className='h-2.5 w-2.5 lg:h-3 lg:w-3' />
									) : (
										<TrendingDown className='h-2.5 w-2.5 lg:h-3 lg:w-3' />
									)}
									<span className='hidden sm:inline'>{Math.abs(card.change).toFixed(1)}%</span>
								</Badge>
							)}
						</div>
						<div>
							<p className='text-xs lg:text-sm font-medium text-gray-600 mb-1 line-clamp-2'>
								{card.title}
							</p>
							<p className='text-lg lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2 truncate'>
								{card.value}
							</p>
							<p className='text-xs text-gray-500 truncate'>
								{card.subtitle}
							</p>
						</div>
					</div>
				))}
			</div>

			{/* Sales Chart */}
			<div className='bg-white rounded-xl border border-gray-200'>
				<SalesChart />
			</div>

			{/* Additional Analytics Sections */}
			<div className='grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2'>
				{/* Top Selling Items */}
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
							<BarChart3 className='h-5 w-5 text-blue-600' />
							Top Selling Items
						</h3>
						<Badge variant='secondary' className='text-xs'>
							Last 30 days
						</Badge>
					</div>
					{metrics?.topSellingItems && metrics.topSellingItems.length > 0 ? (
						<div className='space-y-2 lg:space-y-3 max-h-80 overflow-y-auto'>
							{metrics.topSellingItems.slice(0, 5).map((item, index) => (
								<div key={item.id} className='flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-md lg:rounded-lg'>
									<div className='flex items-center gap-2 lg:gap-3 flex-1 min-w-0'>
										<div className='w-6 h-6 lg:w-8 lg:h-8 bg-blue-100 rounded-md lg:rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs lg:text-sm flex-shrink-0'>
											{index + 1}
										</div>
										<div className='min-w-0 flex-1'>
											<p className='font-medium text-gray-900 text-sm lg:text-base truncate'>{item.name}</p>
											<p className='text-xs lg:text-sm text-gray-600'>{item.quantity} sold</p>
										</div>
									</div>
									<div className='text-right flex-shrink-0'>
										<p className='font-semibold text-gray-900 text-sm lg:text-base'>₹{item.revenue.toFixed(2)}</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className='text-center py-8 text-gray-500'>
							<BarChart3 className='h-12 w-12 mx-auto mb-3 opacity-50' />
							<p>No sales data available</p>
						</div>
					)}
				</div>

				{/* Performance Summary */}
				<div className='bg-white rounded-xl border border-gray-200 p-6'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
							<Calendar className='h-5 w-5 text-green-600' />
							Performance Summary
						</h3>
						<Badge variant='secondary' className='text-xs'>
							Today
						</Badge>
					</div>
					<div className='space-y-3 lg:space-y-4'>
						<div className='flex items-center justify-between p-2 lg:p-3 bg-green-50 rounded-md lg:rounded-lg'>
							<div className='flex items-center gap-2 lg:gap-3 min-w-0 flex-1'>
								<div className='w-2 h-2 bg-green-500 rounded-full flex-shrink-0'></div>
								<span className='text-xs lg:text-sm font-medium text-gray-700 truncate'>Orders Today</span>
							</div>
							<span className='font-semibold text-gray-900 text-sm lg:text-base flex-shrink-0'>
								{salesData?.dailySales?.[salesData.dailySales.length - 1]?.count || 0}
							</span>
						</div>
						<div className='flex items-center justify-between p-2 lg:p-3 bg-blue-50 rounded-md lg:rounded-lg'>
							<div className='flex items-center gap-2 lg:gap-3 min-w-0 flex-1'>
								<div className='w-2 h-2 bg-blue-500 rounded-full flex-shrink-0'></div>
								<span className='text-xs lg:text-sm font-medium text-gray-700 truncate'>Revenue Today</span>
							</div>
							<span className='font-semibold text-gray-900 text-sm lg:text-base flex-shrink-0'>
								₹{Number(salesData?.dailySales?.[salesData.dailySales.length - 1]?.totalAmount || 0).toFixed(2)}
							</span>
						</div>
						<div className='flex items-center justify-between p-2 lg:p-3 bg-cyan-50 rounded-md lg:rounded-lg'>
							<div className='flex items-center gap-2 lg:gap-3 min-w-0 flex-1'>
								<div className='w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0'></div>
								<span className='text-xs lg:text-sm font-medium text-gray-700 truncate'>Avg Order Value</span>
							</div>
							<span className='font-semibold text-gray-900 text-sm lg:text-base flex-shrink-0'>
								₹{(metrics?.averageOrderValue || 0).toFixed(2)}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
