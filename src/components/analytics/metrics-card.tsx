'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
	title: string;
	value: string | number;
	description?: string;
	icon?: ReactNode;
	change?: number;
	className?: string;
	trend?: string;
	trendIcon?: ReactNode;
}

export function MetricsCard({
	title,
	value,
	description,
	icon,
	change,
	className,
	trend,
	trendIcon
}: MetricsCardProps) {
	return (
		<Card
			variant='interactive'
			className={cn('overflow-hidden hover-raise', className)}>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<CardTitle className='text-sm font-medium flex items-center gap-2'>
					{icon && <div className='text-primary'>{icon}</div>}
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='text-3xl font-bold'>{value}</div>
				{(change !== undefined || description) && (
					<p className='text-sm text-muted-foreground mt-1'>{description}</p>
				)}
				{trend && (
					<div className='flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600'>
						{trendIcon}
						{trend}
					</div>
				)}
				{change !== undefined && !trend && (
					<div
						className={cn(
							'flex items-center mt-2 text-xs font-medium',
							change > 0 ? 'text-emerald-600' : 'text-red-600'
						)}>
						{change > 0 ? (
							<ArrowUpIcon className='mr-1 h-3 w-3' />
						) : (
							<ArrowDownIcon className='mr-1 h-3 w-3' />
						)}
						{Math.abs(change)}%
					</div>
				)}
			</CardContent>
		</Card>
	);
}
