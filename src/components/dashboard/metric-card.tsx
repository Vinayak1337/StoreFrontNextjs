'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
	title: string;
	value: string | number;
	change: string | number;
	icon: LucideIcon;
	iconColor: string;
	loading?: boolean;
	suffix?: string;
	description?: string;
}

export function MetricCard({
	title,
	value,
	change,
	icon: Icon,
	iconColor,
	loading = false,
	suffix = '',
	description
}: MetricCardProps) {
	const changeNum = Number(change);
	const isPositive = changeNum >= 0;

	return (
		<div className='group rounded-xl border bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]'>
			<div className='p-4 md:p-6 space-y-3'>
				{/* Header */}
				<div className='flex justify-between items-start'>
					<h3 className='text-sm font-semibold text-gray-600 truncate'>
						{title}
					</h3>
					<div className={cn(
						'p-2.5 rounded-xl transition-colors',
						iconColor
					)}>
						<Icon className='h-4 w-4' />
					</div>
				</div>

				{/* Value */}
				<div className='text-2xl md:text-3xl font-bold text-gray-900'>
					{loading ? (
						<div className='h-8 bg-gray-200 rounded-md animate-pulse w-20 md:w-24' />
					) : (
						<span>{value}{suffix}</span>
					)}
				</div>

				{/* Trend */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-1'>
						{isPositive ? (
							<TrendingUp className='h-3.5 w-3.5 text-green-600' />
						) : (
							<TrendingDown className='h-3.5 w-3.5 text-red-500' />
						)}
						<span className={cn(
							'text-sm font-medium',
							isPositive ? 'text-green-600' : 'text-red-500'
						)}>
							{isPositive ? '+' : ''}{change}%
						</span>
					</div>
					{description && (
						<span className='text-xs text-gray-500 hidden sm:block truncate'>
							{description}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}