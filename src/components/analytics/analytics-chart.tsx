'use client';

import { useState } from 'react';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
	AreaChart,
	Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
	BarChart3,
	LineChart,
	Calendar,
	ArrowUp,
	ArrowDown
} from 'lucide-react';

interface DailySalesData {
	date: string;
	totalAmount: number;
	count: number;
	sales: number;
	orderCount: number;
}

interface AnalyticsChartProps {
	initialData: DailySalesData[];
	onViewModeChange: (mode: 'daily' | 'weekly' | 'monthly') => void;
	loading: boolean;
}

interface TooltipProps {
	active?: boolean;
	payload?: Array<{ value: number; dataKey: string; stroke: string }>;
	label?: string;
}

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
	if (active && payload && payload.length) {
		return (
			<div className='bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-4 animate-fade-in'>
				<p className='font-medium text-sm mb-2'>{label}</p>
				{payload.map((entry, index) => (
					<div
						key={index}
						className='flex items-center justify-between gap-3 mb-1'>
						<div className='flex items-center gap-2'>
							<div
								className='w-3 h-3 rounded-full'
								style={{ backgroundColor: entry.stroke }}
							/>
								<span className='text-sm'>
									{entry.dataKey === 'sales' ? 'Revenue' : 'Gross Margin'}:
								</span>
						</div>
						<span className='text-sm font-semibold'>
							₹{entry.value.toFixed(2)}
						</span>
					</div>
				))}
			</div>
		);
	}
	return null;
};

export function AnalyticsChart({ initialData, onViewModeChange, loading }: AnalyticsChartProps) {
	const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
	const [chartType, setChartType] = useState<'bar' | 'area'>('area');

	// Handle view mode change
	const handleViewModeChange = (newMode: 'daily' | 'weekly' | 'monthly') => {
		setViewMode(newMode);
		onViewModeChange(newMode);
	};

	// Format data for the chart based on view mode
	const formatChartData = () => {
		if (!initialData || initialData.length === 0) {
			return [];
		}

		let data = [...initialData]; // Create a copy

		// Group data based on view mode
		if (viewMode === 'weekly') {
			// Group by week
			const weeklyData: { [key: string]: { totalAmount: number; count: number } } = {};
			data.forEach(item => {
				try {
					const date = new Date(item.date + 'T00:00:00.000Z');
					const weekStart = new Date(date);
					weekStart.setDate(date.getDate() - date.getDay());
					const weekKey = weekStart.toISOString().split('T')[0];
					
					if (!weeklyData[weekKey]) {
						weeklyData[weekKey] = { totalAmount: 0, count: 0 };
					}
					weeklyData[weekKey].totalAmount += Number(item.totalAmount || 0);
					weeklyData[weekKey].count += Number(item.count || 0);
				} catch {
					// Skip invalid data
				}
			});
			
			data = Object.entries(weeklyData)
				.sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
				.map(([date, values]) => ({
					date,
					totalAmount: values.totalAmount,
					count: values.count,
					sales: values.totalAmount,
					orderCount: values.count
				}));
		} else if (viewMode === 'monthly') {
			// Group by month
			const monthlyData: { [key: string]: { totalAmount: number; count: number } } = {};
			data.forEach(item => {
				try {
					const date = new Date(item.date + 'T00:00:00.000Z');
					const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
					
					if (!monthlyData[monthKey]) {
						monthlyData[monthKey] = { totalAmount: 0, count: 0 };
					}
					monthlyData[monthKey].totalAmount += Number(item.totalAmount || 0);
					monthlyData[monthKey].count += Number(item.count || 0);
				} catch {
					// Skip invalid data
				}
			});
			
			data = Object.entries(monthlyData)
				.sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
				.map(([date, values]) => ({
					date,
					totalAmount: values.totalAmount,
					count: values.count,
					sales: values.totalAmount,
					orderCount: values.count
				}));
		} else {
			// Sort daily data by date
			data = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		}

		// Format the data for chart display with realistic wholesale margins
		const formattedData = data.map(item => {
			try {
				const dateObj = new Date(item.date + 'T00:00:00.000Z');
				const revenue = Number(item.totalAmount || 0);
				// Profit margin for wholesale (10% gross margin)
				const grossMargin = revenue * 0.10;
				
				return {
					date: viewMode === 'monthly' 
						? format(dateObj, 'MMM yyyy')
						: viewMode === 'weekly'
						? `Week of ${format(dateObj, 'MMM dd')}`
						: format(dateObj, 'MMM dd'),
					sales: revenue,
					profit: grossMargin
				};
			} catch {
				// Skip invalid data
				const revenue = Number(item.totalAmount || 0);
				return {
					date: item.date,
					sales: revenue,
					profit: revenue * 0.10
				};
			}
		});
		
		return formattedData;
	};

	const chartData = formatChartData();

	// Calculate trends
	const calculateTrend = () => {
		if (chartData.length < 2) return { percentage: 0, isPositive: true };

		const lastValue = chartData[chartData.length - 1]?.sales || 0;
		const previousValue = chartData[chartData.length - 2]?.sales || 0;

		if (previousValue === 0) return { percentage: 100, isPositive: true };

		const percentage = ((lastValue - previousValue) / previousValue) * 100;
		return {
			percentage: Math.abs(percentage),
			isPositive: percentage >= 0
		};
	};

	const trend = calculateTrend();

	// Chart colors
	const colorPalette = {
		revenue: '#059669',
		profit: '#10b981',
		grid: 'rgba(148, 163, 184, 0.1)'
	};

	return (
		<Card className='col-span-full animate-fade-in'>
			<CardHeader className='flex flex-col sm:flex-row sm:items-center justify-between pb-4 space-y-4 sm:space-y-0'>
				<div className='flex-1'>
					<CardTitle className='text-base sm:text-lg font-medium flex items-center gap-2'>
						<div className='icon-container'>
							<BarChart3 className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
						</div>
						Sales Overview
					</CardTitle>
					<div className='mt-1 flex items-center text-xs sm:text-sm text-muted-foreground'>
						{trend.isPositive ? (
							<span className='flex items-center gap-1 text-success font-medium'>
								<ArrowUp className='h-3 w-3 sm:h-4 sm:w-4' />
								Up {trend.percentage.toFixed(1)}% from previous period
							</span>
						) : (
							<span className='flex items-center gap-1 text-destructive font-medium'>
								<ArrowDown className='h-3 w-3 sm:h-4 sm:w-4' />
								Down {trend.percentage.toFixed(1)}% from previous period
							</span>
						)}
					</div>
				</div>
				<div className='flex flex-wrap gap-2'>
					<div className='bg-muted/50 rounded-lg p-1 mr-2'>
						<Button
							size='sm'
							variant={chartType === 'bar' ? 'default' : 'ghost'}
							onClick={() => setChartType('bar')}
							className='h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-md'
							title='Bar Chart'>
							<BarChart3 className='h-3 w-3 sm:h-4 sm:w-4' />
						</Button>
						<Button
							size='sm'
							variant={chartType === 'area' ? 'default' : 'ghost'}
							onClick={() => setChartType('area')}
							className='h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-md'
							title='Area Chart'>
							<LineChart className='h-3 w-3 sm:h-4 sm:w-4' />
						</Button>
					</div>
					<Button
						size='sm'
						variant={viewMode === 'daily' ? 'default' : 'outline'}
						onClick={() => handleViewModeChange('daily')}
						disabled={loading}
						className={`shadow-sm rounded-lg gap-1 text-xs sm:text-sm ${
							viewMode === 'daily' ? 'bg-emerald-600 text-white' : ''
						}`}>
						<Calendar className='h-3 w-3 sm:h-4 sm:w-4' />
						<span className='hidden xs:inline'>Daily</span>
					</Button>
					<Button
						size='sm'
						variant={viewMode === 'weekly' ? 'default' : 'outline'}
						onClick={() => handleViewModeChange('weekly')}
						disabled={loading}
						className={`shadow-sm rounded-lg text-xs sm:text-sm ${
							viewMode === 'weekly' ? 'bg-emerald-600 text-white' : ''
						}`}>
						<span className='hidden xs:inline'>Weekly</span>
						<span className='xs:hidden'>Week</span>
					</Button>
					<Button
						size='sm'
						variant={viewMode === 'monthly' ? 'default' : 'outline'}
						onClick={() => handleViewModeChange('monthly')}
						disabled={loading}
						className={`shadow-sm rounded-lg text-xs sm:text-sm ${
							viewMode === 'monthly' ? 'bg-emerald-600 text-white' : ''
						}`}>
						<span className='hidden xs:inline'>Monthly</span>
						<span className='xs:hidden'>Month</span>
					</Button>
				</div>
			</CardHeader>
			<CardContent className='p-3 sm:p-6'>
				{loading ? (
					<div className='flex justify-center items-center h-60 sm:h-80 animate-pulse'>
						<div className='text-center'>
							<BarChart3 className='h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 opacity-30' />
							<p className='text-sm sm:text-base'>Loading chart data...</p>
						</div>
					</div>
				) : chartData.length === 0 ? (
					<div className='flex justify-center items-center h-60 sm:h-80 border border-dashed rounded-lg'>
						<div className='text-center text-muted-foreground'>
							<BarChart3 className='h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 opacity-30' />
							<p className='text-sm sm:text-base'>No sales data available</p>
							<p className='text-xs sm:text-sm mt-1'>
								Sales information will appear here once data is available
							</p>
						</div>
					</div>
				) : (
					<div className='h-60 sm:h-80 animate-slide-in'>
						<ResponsiveContainer width='100%' height='100%'>
							{chartType === 'bar' ? (
								<BarChart
									data={chartData}
									margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
									<CartesianGrid
										strokeDasharray='3 3'
										vertical={false}
										stroke={colorPalette.grid}
									/>
									<XAxis
										dataKey='date'
										axisLine={false}
										tickLine={false}
										tickMargin={10}
										fontSize={12}
									/>
									<YAxis
										tickFormatter={value => `₹${value}`}
										axisLine={false}
										tickLine={false}
										tickMargin={10}
										fontSize={12}
									/>
									<Tooltip content={<CustomTooltip />} />
									<Legend
										iconType='circle'
										iconSize={8}
										wrapperStyle={{ paddingTop: 15 }}
									/>
									<Bar
										dataKey='sales'
										name='Revenue'
										fill={colorPalette.revenue}
										radius={[4, 4, 0, 0]}
										animationDuration={1000}
									/>
									<Bar
										dataKey='profit'
										name='Gross Margin (10%)'
										fill={colorPalette.profit}
										radius={[4, 4, 0, 0]}
										animationDuration={1000}
										animationBegin={300}
									/>
								</BarChart>
							) : (
								<AreaChart
									data={chartData}
									margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
									<defs>
										<linearGradient
											id='revenueGradient'
											x1='0'
											y1='0'
											x2='0'
											y2='1'>
											<stop
												offset='5%'
												stopColor={colorPalette.revenue}
												stopOpacity={0.8}
											/>
											<stop
												offset='95%'
												stopColor={colorPalette.revenue}
												stopOpacity={0.1}
											/>
										</linearGradient>
										<linearGradient
											id='profitGradient'
											x1='0'
											y1='0'
											x2='0'
											y2='1'>
											<stop
												offset='5%'
												stopColor={colorPalette.profit}
												stopOpacity={0.8}
											/>
											<stop
												offset='95%'
												stopColor={colorPalette.profit}
												stopOpacity={0.1}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid
										strokeDasharray='3 3'
										vertical={false}
										stroke={colorPalette.grid}
									/>
									<XAxis
										dataKey='date'
										axisLine={false}
										tickLine={false}
										tickMargin={10}
										fontSize={12}
									/>
									<YAxis
										tickFormatter={value => `₹${value}`}
										axisLine={false}
										tickLine={false}
										tickMargin={10}
										fontSize={12}
									/>
									<Tooltip content={<CustomTooltip />} />
									<Legend
										iconType='circle'
										iconSize={8}
										wrapperStyle={{ paddingTop: 15 }}
									/>
									<Area
										type='monotone'
										dataKey='sales'
										name='Revenue'
										stroke={colorPalette.revenue}
										fillOpacity={1}
										fill='url(#revenueGradient)'
										strokeWidth={2}
										animationDuration={1000}
									/>
									<Area
										type='monotone'
										dataKey='profit'
										name='Gross Margin (10%)'
										stroke={colorPalette.profit}
										fillOpacity={1}
										fill='url(#profitGradient)'
										strokeWidth={2}
										animationDuration={1000}
										animationBegin={300}
									/>
								</AreaChart>
							)}
						</ResponsiveContainer>
					</div>
				)}
			</CardContent>
		</Card>
	);
}