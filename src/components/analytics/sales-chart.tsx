'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
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
import { RootState } from '@/lib/redux/store';
import { format } from 'date-fns';
import {
	BarChart3,
	LineChart,
	Calendar,
	ArrowUp,
	ArrowDown
} from 'lucide-react';

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
								{entry.dataKey === 'sales' ? 'Revenue' : 'Profit'}:
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

export function SalesChart() {
	const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>(
		'daily'
	);
	const [chartType, setChartType] = useState<'bar' | 'area'>('area');
	const { salesData, loading } = useSelector(
		(state: RootState) => state.analytics
	);

	// Format data for the chart
	const formatChartData = () => {
		if (!salesData || !salesData.dailySales) return [];

		return salesData.dailySales.map(item => ({
			date: format(new Date(item.date), 'MMM dd'),
			sales: Number(item.totalAmount),
			profit: Number(item.totalAmount) * 0.3 // Assuming 30% profit margin for visualization
		}));
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
		revenue: '#8b5cf6', // purple-500
		profit: '#06b6d4', // cyan-500
		grid: 'rgba(148, 163, 184, 0.1)' // slate-400 with opacity
	};

	return (
		<Card className='col-span-full animate-fade-in'>
			<CardHeader className='flex flex-row items-center justify-between pb-4'>
				<div>
					<CardTitle className='text-lg font-medium flex items-center gap-2'>
						<div className='icon-container'>
							<BarChart3 className='h-5 w-5 text-primary' />
						</div>
						Sales Overview
					</CardTitle>
					<div className='mt-1 flex items-center text-sm text-muted-foreground'>
						{trend.isPositive ? (
							<span className='flex items-center gap-1 text-success font-medium'>
								<ArrowUp className='h-4 w-4' />
								Up {trend.percentage.toFixed(1)}% from previous period
							</span>
						) : (
							<span className='flex items-center gap-1 text-destructive font-medium'>
								<ArrowDown className='h-4 w-4' />
								Down {trend.percentage.toFixed(1)}% from previous period
							</span>
						)}
					</div>
				</div>
				<div className='flex gap-2'>
					<div className='bg-muted/50 rounded-lg p-1 mr-2'>
						<Button
							size='sm'
							variant={chartType === 'bar' ? 'default' : 'ghost'}
							onClick={() => setChartType('bar')}
							className='h-8 w-8 p-0 rounded-md'
							title='Bar Chart'>
							<BarChart3 className='h-4 w-4' />
						</Button>
						<Button
							size='sm'
							variant={chartType === 'area' ? 'default' : 'ghost'}
							onClick={() => setChartType('area')}
							className='h-8 w-8 p-0 rounded-md'
							title='Area Chart'>
							<LineChart className='h-4 w-4' />
						</Button>
					</div>
					<Button
						size='sm'
						variant={viewMode === 'daily' ? 'gradient' : 'outline'}
						onClick={() => setViewMode('daily')}
						className='shadow-sm rounded-lg gap-1'>
						<Calendar className='h-4 w-4' />
						Daily
					</Button>
					<Button
						size='sm'
						variant={viewMode === 'weekly' ? 'gradient' : 'outline'}
						onClick={() => setViewMode('weekly')}
						className='shadow-sm rounded-lg'>
						Weekly
					</Button>
					<Button
						size='sm'
						variant={viewMode === 'monthly' ? 'gradient' : 'outline'}
						onClick={() => setViewMode('monthly')}
						className='shadow-sm rounded-lg'>
						Monthly
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className='flex justify-center items-center h-80 animate-pulse'>
						<div className='text-center'>
							<BarChart3 className='h-10 w-10 mx-auto mb-2 opacity-30' />
							<p>Loading chart data...</p>
						</div>
					</div>
				) : chartData.length === 0 ? (
					<div className='flex justify-center items-center h-80 border border-dashed rounded-lg'>
						<div className='text-center text-muted-foreground'>
							<BarChart3 className='h-10 w-10 mx-auto mb-2 opacity-30' />
							<p>No sales data available</p>
							<p className='text-sm mt-1'>
								Sales information will appear here once data is available
							</p>
						</div>
					</div>
				) : (
					<div className='h-80 animate-slide-in'>
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
									/>
									<YAxis
										tickFormatter={value => `₹${value}`}
										axisLine={false}
										tickLine={false}
										tickMargin={10}
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
										name='Profit'
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
									/>
									<YAxis
										tickFormatter={value => `₹${value}`}
										axisLine={false}
										tickLine={false}
										tickMargin={10}
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
										name='Profit'
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
