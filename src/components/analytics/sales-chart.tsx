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
	Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RootState } from '@/lib/redux/store';
import { format } from 'date-fns';

interface TooltipProps {
	active?: boolean;
	payload?: Array<{ value: number }>;
	label?: string;
}

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
	if (active && payload && payload.length) {
		return (
			<div className='bg-background border rounded-md shadow-md p-3'>
				<p className='font-medium'>{label}</p>
				<p className='text-sm text-green-600'>
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
	const { salesData, loading } = useSelector(
		(state: RootState) => state.analytics
	);

	// Format data for the chart
	const formatChartData = () => {
		if (!salesData || !salesData.dailySales) return [];

		return salesData.dailySales.map(item => ({
			date: format(new Date(item.date), 'MMM dd'),
			sales: Number(item.totalAmount)
		}));
	};

	const chartData = formatChartData();

	return (
		<Card className='col-span-full'>
			<CardHeader className='flex flex-row items-center justify-between pb-2'>
				<CardTitle className='text-lg font-medium'>Sales Overview</CardTitle>
				<div className='flex gap-2'>
					<Button
						size='sm'
						variant={viewMode === 'daily' ? 'default' : 'outline'}
						onClick={() => setViewMode('daily')}>
						Daily
					</Button>
					<Button
						size='sm'
						variant={viewMode === 'weekly' ? 'default' : 'outline'}
						onClick={() => setViewMode('weekly')}>
						Weekly
					</Button>
					<Button
						size='sm'
						variant={viewMode === 'monthly' ? 'default' : 'outline'}
						onClick={() => setViewMode('monthly')}>
						Monthly
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className='flex justify-center items-center h-80'>
						<p>Loading chart data...</p>
					</div>
				) : chartData.length === 0 ? (
					<div className='flex justify-center items-center h-80'>
						<p className='text-muted-foreground'>No sales data available</p>
					</div>
				) : (
					<div className='h-80'>
						<ResponsiveContainer width='100%' height='100%'>
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
									name='Sales'
									fill='#22c55e'
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
