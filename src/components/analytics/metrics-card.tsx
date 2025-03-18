'use client';

import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
	title: string;
	value: string | number;
	change: number;
	trend?: 'up' | 'down';
	color?: string;
	icon?: React.ReactNode;
	variant?: 'default' | 'glass' | 'gradient';
	subtitle?: string;
	loading?: boolean;
}

export function MetricsCard({
	title,
	value,
	change,
	trend = 'up',
	color,
	icon,
	variant = 'default',
	subtitle,
	loading = false
}: MetricsCardProps) {
	const trendColor = trend === 'up' ? 'text-success' : 'text-destructive';
	const trendIcon =
		trend === 'up' ? (
			<TrendingUp className='h-4 w-4' />
		) : (
			<TrendingDown className='h-4 w-4' />
		);
	const changeIcon =
		change > 0 ? (
			<ArrowUp className='h-3 w-3' />
		) : (
			<ArrowDown className='h-3 w-3' />
		);
	const changeColor = change > 0 ? 'text-success' : 'text-destructive';

	// Convert variant prop to glass/gradient props for Card
	const isGlass = variant === 'glass';
	const isGradient = variant === 'gradient';

	return (
		<Card
			glass={isGlass}
			gradient={isGradient}
			className={cn(
				'hover:shadow-md transition-all duration-300 animate-fade-in overflow-hidden',
				loading && 'animate-pulse'
			)}>
			<CardContent className='p-6'>
				<div className='flex justify-between items-start mb-2'>
					<div className='space-y-1.5'>
						<p className='text-sm font-medium text-muted-foreground'>{title}</p>
						{subtitle && (
							<p className='text-xs text-muted-foreground/70'>{subtitle}</p>
						)}
					</div>
					{icon && (
						<div
							className={cn(
								'p-2 rounded-full',
								color ? `bg-${color}-500/10` : 'bg-primary/10'
							)}>
							{icon}
						</div>
					)}
				</div>

				<div className='flex flex-col space-y-1.5'>
					<div className='flex items-baseline'>
						<h3 className='text-2xl font-bold tracking-tight'>
							{loading ? (
								<div className='h-7 w-20 bg-muted rounded animate-pulse' />
							) : (
								value
							)}
						</h3>
					</div>

					<div className='flex items-center gap-1.5'>
						{!loading ? (
							<>
								<div className={cn('flex items-center gap-0.5', changeColor)}>
									{changeIcon}
									<span className='text-xs font-medium'>
										{Math.abs(change)}%
									</span>
								</div>
								<span className='text-xs text-muted-foreground'>
									from last period
								</span>
								<div className='ml-auto'>
									{trendIcon && (
										<div className={cn('flex items-center gap-1', trendColor)}>
											{trendIcon}
										</div>
									)}
								</div>
							</>
						) : (
							<div className='h-4 w-32 bg-muted rounded animate-pulse' />
						)}
					</div>
				</div>

				{/* Subtle accent pattern for background interest */}
				<div
					className={cn(
						'absolute bottom-0 right-0 w-24 h-24 -mr-6 -mb-6 rounded-full opacity-10',
						trend === 'up' ? 'bg-success' : 'bg-destructive'
					)}
				/>
			</CardContent>
		</Card>
	);
}
