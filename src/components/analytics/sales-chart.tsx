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
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RootState } from '@/lib/redux/store';
import { format } from 'date-fns';
import { BarChart3, LineChart, Calendar } from 'lucide-react';

interface TooltipProps {
	active?: boolean;
	payload?: Array<{ value: number }>;
	label?: string;
}

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
	if (active && payload && payload.length) {
		return (
			<div className='bg-background border rounded-md shadow-md p-3 animate-fade-in'>
				<p className='font-medium'>{label}</p>
				<p className='text-sm text-green-600 font-semibold mt-1'>
					Sales: ${payload[0].value.toFixed(2)}
				</p>
			</div>
		);
	}
	return null;
};

export function SalesChart() {
	const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>(
		'daily'
	);
	const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
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

	return (
		<Card className='col-span-full animate-fade-in'>
			<CardHeader className='flex flex-row items-center justify-between pb-2'>
				<div>
					<CardTitle className='text-lg font-medium flex items-center gap-2'>
						<BarChart3 className='h-5 w-5 text-primary' />
						Sales Overview
					</CardTitle>
					<CardDescription className='mt-1'>
						{trend.isPositive ? (
							<span className='text-emerald-500 font-medium flex items-center'>
								↑ Up {trend.percentage.toFixed(1)}% from previous period
							</span>
						) : (
							<span className='text-rose-500 font-medium flex items-center'>
								↓ Down {trend.percentage.toFixed(1)}% from previous period
							</span>
						)}
					</CardDescription>
				</div>
				<div className='flex gap-2'>
					<div className='bg-muted/50 rounded-md p-1 mr-2'>
						<Button
							size='sm'
							variant={chartType === 'bar' ? 'default' : 'ghost'}
							onClick={() => setChartType('bar')}
							className='h-8 w-8 p-0'
							title='Bar Chart'>
							<BarChart3 className='h-4 w-4' />
						</Button>
						<Button
							size='sm'
							variant={chartType === 'area' ? 'default' : 'ghost'}
							onClick={() => setChartType('area')}
							className='h-8 w-8 p-0'
							title='Area Chart'>
							<LineChart className='h-4 w-4' />
						</Button>
					</div>
					<Button
						size='sm'
						variant={viewMode === 'daily' ? 'gradient' : 'outline'}
						onClick={() => setViewMode('daily')}
						className='shadow-sm'
						leftIcon={<Calendar className='h-4 w-4' />}>
						Daily
					</Button>
					<Button
						size='sm'
						variant={viewMode === 'weekly' ? 'gradient' : 'outline'}
						onClick={() => setViewMode('weekly')}
						className='shadow-sm'>
						Weekly
					</Button>
					<Button
						size='sm'
						variant={viewMode === 'monthly' ? 'gradient' : 'outline'}
						onClick={() => setViewMode('monthly')}
						className='shadow-sm'>
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
									<CartesianGrid strokeDasharray='3 3' opacity={0.2} />
									<XAxis dataKey='date' />
									<YAxis tickFormatter={value => `$${value}`} />
									<Tooltip content={<CustomTooltip />} />
									<Legend />
									<Bar
										dataKey='sales'
										name='Revenue'
										fill='#22c55e'
										radius={[4, 4, 0, 0]}
									/>
									<Bar
										dataKey='profit'
										name='Profit'
										fill='#0ea5e9'
										radius={[4, 4, 0, 0]}
									/>
								</BarChart>
							) : (
								<AreaChart
									data={chartData}
									margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
									<CartesianGrid strokeDasharray='3 3' opacity={0.2} />
									<XAxis dataKey='date' />
									<YAxis tickFormatter={value => `$${value}`} />
									<Tooltip content={<CustomTooltip />} />
									<Legend />
									<Area
										type='monotone'
										dataKey='sales'
										name='Revenue'
										stroke='#22c55e'
										fill='#22c55e'
										fillOpacity={0.3}
									/>
									<Area
										type='monotone'
										dataKey='profit'
										name='Profit'
										stroke='#0ea5e9'
										fill='#0ea5e9'
										fillOpacity={0.3}
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
