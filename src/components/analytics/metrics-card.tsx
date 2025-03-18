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
}

export function MetricsCard({
	title,
	value,
	description,
	icon,
	change,
	className
}: MetricsCardProps) {
	return (
		<Card className={cn('overflow-hidden', className)}>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<CardTitle className='text-sm font-medium'>{title}</CardTitle>
				{icon}
			</CardHeader>
			<CardContent>
				<div className='text-2xl font-bold'>{value}</div>
				{(change !== undefined || description) && (
					<p className='text-xs text-muted-foreground mt-1 flex items-center'>
						{change !== undefined && (
							<>
								<span
									className={cn(
										'flex items-center mr-1',
										change > 0 ? 'text-green-600' : 'text-red-600'
									)}>
									{change > 0 ? (
										<ArrowUpIcon className='mr-1 h-3 w-3' />
									) : (
										<ArrowDownIcon className='mr-1 h-3 w-3' />
									)}
									{Math.abs(change)}%
								</span>
							</>
						)}
						{description}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
