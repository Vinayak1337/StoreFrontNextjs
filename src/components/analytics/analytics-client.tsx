'use client';

import { useState, useCallback } from 'react';
import {
	TrendingUp,
	TrendingDown,
	DollarSign,
	ShoppingCart,
	BarChart3,
	RefreshCw
} from 'lucide-react';
import { AnalyticsChart } from './analytics-chart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getDailySales } from '@/app/api/analytics/actions';

interface AnalyticsMetrics {
	totalOrders: number;
	totalSales: number;
	averageOrderValue: number;
	ordersTrend: number;
	revenueTrend: number;
	topSellingItems: Array<{
		id: string;
		name: string;
		quantity: number;
		revenue: number;
	}>;
}

interface DailySalesData {
	date: string;
	totalAmount: number;
	count: number;
	sales: number;
	orderCount: number;
}

interface TodayStats {
	ordersCount: number;
	revenue: number;
	averageOrderValue: number;
}

interface AnalyticsClientProps {
	initialMetrics: AnalyticsMetrics;
	initialSalesData: DailySalesData[];
	todayStats: TodayStats;
}

export function AnalyticsClient({ 
	initialMetrics, 
	initialSalesData, 
	todayStats 
}: AnalyticsClientProps) {
	const [salesData, setSalesData] = useState(initialSalesData);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const handleViewModeChange = useCallback(async (mode: 'daily' | 'weekly' | 'monthly') => {
		setLoading(true);
		
		try {
			// Determine date range based on view mode
			let days = 30; // default for daily
			if (mode === 'weekly') days = 84; // 12 weeks
			if (mode === 'monthly') days = 365; // 12 months
			
			const endDate = new Date().toISOString().split('T')[0];
			const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
			
			const newData = await getDailySales(startDate, endDate);
			setSalesData(newData);
		} catch (error) {
			console.error('Error fetching sales data:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	const handleRefresh = async () => {
		setRefreshing(true);
		try {
			// Refresh with current date range (last 30 days)
			const endDate = new Date().toISOString().split('T')[0];
			const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
			
			const newData = await getDailySales(startDate, endDate);
			setSalesData(newData);
		} catch (error) {
			console.error('Error refreshing data:', error);
		} finally {
			setTimeout(() => setRefreshing(false), 1000);
		}
	};

	// Enhanced metrics cards data
	const metricsCards = [
		{
			title: 'Total Revenue',
			value: `₹${initialMetrics.totalSales.toFixed(2)}`,
			icon: <DollarSign className='h-4 w-4 sm:h-5 sm:w-5' />,
			change: initialMetrics.revenueTrend || 0,
			subtitle: 'vs last period',
			color: 'text-green-600',
			bgColor: 'bg-green-100'
		},
		{
			title: 'Total Orders',
			value: initialMetrics.totalOrders.toString(),
			icon: <ShoppingCart className='h-4 w-4 sm:h-5 sm:w-5' />,
			change: initialMetrics.ordersTrend || 0,
			subtitle: `${initialMetrics.totalOrders} completed`,
			color: 'text-emerald-600',
			bgColor: 'bg-emerald-100'
		},
		{
			title: 'Average Order Value',
			value: `₹${initialMetrics.averageOrderValue.toFixed(2)}`,
			icon: <BarChart3 className='h-4 w-4 sm:h-5 sm:w-5' />,
			change: 0, // No trend calculation for AOV
			subtitle: 'per order',
			color: 'text-orange-600',
			bgColor: 'bg-orange-100'
		},
		{
			title: 'Items In Stock',
			value: initialMetrics.topSellingItems.length.toString(),
			icon: <BarChart3 className='h-4 w-4 sm:h-5 sm:w-5' />,
			change: 0,
			subtitle: 'unique items sold',
			color: 'text-blue-600',
			bgColor: 'bg-blue-100'
		}
	];

	return (
		<div className='space-y-4 lg:space-y-6 pb-4 lg:pb-6'>
			{/* Header */}
			<div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
				<div className='flex-1'>
					<h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900'>
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
						className='gap-1 lg:gap-2 text-xs lg:text-sm'>
						<RefreshCw
							className={`h-3 w-3 lg:h-4 lg:w-4 ${
								refreshing ? 'animate-spin' : ''
							}`}
						/>
						<span className='hidden sm:inline'>Refresh</span>
					</Button>
				</div>
			</div>

			{/* Metrics Cards */}
			<div className='grid gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-4'>
				{metricsCards.map((card, index) => (
					<div
						key={card.title}
						className='bg-white rounded-lg lg:rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-all duration-200'
						style={{ animationDelay: `${index * 100}ms` }}>
						<div className='flex items-center justify-between mb-2 sm:mb-3 lg:mb-4'>
							<div
								className={`p-1.5 lg:p-2 rounded-md lg:rounded-lg ${card.bgColor}`}>
								<div className={card.color}>{card.icon}</div>
							</div>
							{card.change !== 0 && (
								<Badge
									variant={card.change > 0 ? 'default' : 'destructive'}
									className='gap-0.5 lg:gap-1 text-xs px-1.5 lg:px-2'>
									{card.change > 0 ? (
										<TrendingUp className='h-2.5 w-2.5 lg:h-3 lg:w-3' />
									) : (
										<TrendingDown className='h-2.5 w-2.5 lg:h-3 lg:w-3' />
									)}
									<span className='hidden sm:inline'>
										{Math.abs(card.change).toFixed(1)}%
									</span>
								</Badge>
							)}
						</div>
						<div>
							<p className='text-xs lg:text-sm font-medium text-gray-600 mb-1 line-clamp-2'>
								{card.title}
							</p>
							<p className='text-base sm:text-lg lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2 truncate'>
								{card.value}
							</p>
							<p className='text-xs text-gray-500 truncate'>{card.subtitle}</p>
						</div>
					</div>
				))}
			</div>

			{/* Sales Chart */}
			<div className='bg-white rounded-xl border border-gray-200'>
				<AnalyticsChart 
					initialData={salesData}
					onViewModeChange={handleViewModeChange}
					loading={loading}
				/>
			</div>

			{/* Additional Analytics Sections */}
			<div className='grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2'>
				{/* Top Selling Items */}
				<div className='bg-white rounded-xl border border-gray-200 p-4 sm:p-6'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2'>
							<BarChart3 className='h-4 w-4 sm:h-5 sm:w-5 text-emerald-600' />
							Top Selling Items
						</h3>
						<Badge variant='secondary' className='text-xs'>
							Last 30 days
						</Badge>
					</div>
					{initialMetrics.topSellingItems && initialMetrics.topSellingItems.length > 0 ? (
						<div className='space-y-2 lg:space-y-3 max-h-80 overflow-y-auto'>
							{initialMetrics.topSellingItems.slice(0, 5).map((item, index) => (
								<div
									key={item.id}
									className='flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-md lg:rounded-lg'>
									<div className='flex items-center gap-2 lg:gap-3 flex-1 min-w-0'>
										<div className='w-6 h-6 lg:w-8 lg:h-8 bg-emerald-100 rounded-md lg:rounded-lg flex items-center justify-center text-emerald-600 font-bold text-xs lg:text-sm flex-shrink-0'>
											{index + 1}
										</div>
										<div className='min-w-0 flex-1'>
											<p className='font-medium text-gray-900 text-sm lg:text-base truncate'>
												{item.name}
											</p>
											<p className='text-xs lg:text-sm text-gray-600'>
												{item.quantity} sold
											</p>
										</div>
									</div>
									<div className='text-right flex-shrink-0'>
										<p className='font-semibold text-gray-900 text-sm lg:text-base'>
											₹{item.revenue.toFixed(2)}
										</p>
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

				{/* Today's Performance Summary */}
				<div className='bg-white rounded-xl border border-gray-200 p-4 sm:p-6'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2'>
							<BarChart3 className='h-4 w-4 sm:h-5 sm:w-5 text-green-600' />
							Today&apos;s Performance
						</h3>
						<Badge variant='secondary' className='text-xs'>
							Today
						</Badge>
					</div>
					<div className='space-y-3 lg:space-y-4'>
						<div className='flex items-center justify-between p-2 lg:p-3 bg-green-50 rounded-md lg:rounded-lg'>
							<div className='flex items-center gap-2 lg:gap-3 min-w-0 flex-1'>
								<div className='w-2 h-2 bg-green-500 rounded-full flex-shrink-0'></div>
								<span className='text-xs lg:text-sm font-medium text-gray-700 truncate'>
									Orders Today
								</span>
							</div>
							<span className='font-semibold text-gray-900 text-sm lg:text-base flex-shrink-0'>
								{todayStats.ordersCount}
							</span>
						</div>
						<div className='flex items-center justify-between p-2 lg:p-3 bg-emerald-50 rounded-md lg:rounded-lg'>
							<div className='flex items-center gap-2 lg:gap-3 min-w-0 flex-1'>
								<div className='w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0'></div>
								<span className='text-xs lg:text-sm font-medium text-gray-700 truncate'>
									Revenue Today
								</span>
							</div>
							<span className='font-semibold text-gray-900 text-sm lg:text-base flex-shrink-0'>
								₹{todayStats.revenue.toFixed(2)}
							</span>
						</div>
						<div className='flex items-center justify-between p-2 lg:p-3 bg-emerald-50 rounded-md lg:rounded-lg'>
							<div className='flex items-center gap-2 lg:gap-3 min-w-0 flex-1'>
								<div className='w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0'></div>
								<span className='text-xs lg:text-sm font-medium text-gray-700 truncate'>
									Avg Order Value
								</span>
							</div>
							<span className='font-semibold text-gray-900 text-sm lg:text-base flex-shrink-0'>
								₹{todayStats.averageOrderValue.toFixed(2)}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}