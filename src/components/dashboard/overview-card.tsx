'use client';

import { MoreHorizontal, ExternalLink, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface OverviewCardProps {
	title: string;
	value: string | number;
	description?: string;
	change?: number;
	data?: { value: number; date: string }[];
	icon?: React.ReactNode;
	color?:
		| 'default'
		| 'primary'
		| 'secondary'
		| 'success'
		| 'warning'
		| 'destructive';
	variant?: 'default' | 'glass' | 'gradient';
	actions?: { label: string; href: string }[];
	isLoading?: boolean;
}

export function OverviewCard({
	title,
	value,
	description,
	change,
	data = [],
	icon,
	color = 'default',
	variant = 'default',
	actions = [],
	isLoading = false
}: OverviewCardProps) {
	const isPositiveChange = change ? change > 0 : false;
	const changeDisplay = change ? Math.abs(change) : undefined;

	// Determine color classes
	const colorClasses = {
		default: 'from-primary/20 to-primary/5 text-primary',
		primary: 'from-primary/20 to-primary/5 text-primary',
		secondary: 'from-secondary/20 to-secondary/5 text-secondary',
		success: 'from-success/20 to-success/5 text-success',
		warning: 'from-warning/20 to-warning/5 text-warning',
		destructive: 'from-destructive/20 to-destructive/5 text-destructive'
	};

	// Convert variant prop to glass/gradient props
	const isGlass = variant === 'glass';
	const isGradient = variant === 'gradient';

	// Simple sparkline renderer
	const renderSparkline = () => {
		if (data.length === 0) return null;

		// Calculate dimensions
		const width = 120;
		const height = 40;
		const padding = 4;
		const graphWidth = width - padding * 2;
		const graphHeight = height - padding * 2;

		// Find min/max to scale the graph
		const maxValue = Math.max(...data.map(d => d.value));
		const minValue = Math.min(...data.map(d => d.value));
		const range = maxValue - minValue || 1;

		// Generate points
		const points = data
			.map((d, index) => {
				const x = padding + (index / (data.length - 1)) * graphWidth;
				const y =
					padding + graphHeight - ((d.value - minValue) / range) * graphHeight;
				return `${x},${y}`;
			})
			.join(' ');

		// Color based on trend
		const strokeColor = isPositiveChange
			? 'var(--success)'
			: 'var(--destructive)';
		const fillColor = isPositiveChange
			? 'rgba(34, 197, 94, 0.1)'
			: 'rgba(239, 68, 68, 0.1)';

		return (
			<svg width={width} height={height} className='overflow-visible mt-1'>
				{/* Baseline */}
				<line
					x1={padding}
					y1={height - padding}
					x2={width - padding}
					y2={height - padding}
					stroke='var(--border)'
					strokeWidth='1'
					strokeDasharray='2,2'
				/>

				{/* Fill area under the line */}
				<polygon
					points={`${padding},${height - padding} ${points} ${
						width - padding
					},${height - padding}`}
					fill={fillColor}
					strokeWidth='0'
				/>

				{/* Line */}
				<polyline
					points={points}
					fill='none'
					stroke={strokeColor}
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
				/>

				{/* Dots at data points */}
				{data.map((d, index) => {
					const x = padding + (index / (data.length - 1)) * graphWidth;
					const y =
						padding +
						graphHeight -
						((d.value - minValue) / range) * graphHeight;

					return (
						<circle
							key={index}
							cx={x}
							cy={y}
							r='2'
							fill={strokeColor}
							stroke='var(--background)'
							strokeWidth='1'
							className={index === data.length - 1 ? 'animate-pulse' : ''}
						/>
					);
				})}
			</svg>
		);
	};

	return (
		<Card
			glass={isGlass}
			gradient={isGradient}
			className={cn(
				'overflow-hidden relative animate-fade-in h-full',
				isLoading && 'animate-pulse'
			)}>
			{/* Card header */}
			<CardHeader className='p-4 flex flex-row items-start justify-between space-y-0'>
				<div className='flex items-center gap-2'>
					{icon && (
						<div
							className={cn(
								'p-2 rounded-full bg-gradient-to-br',
								colorClasses[color]
							)}>
							{icon}
						</div>
					)}
					<CardTitle className='text-sm font-medium'>{title}</CardTitle>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant='ghost'
							size='icon'
							className='h-8 w-8 rounded-full'>
							<MoreHorizontal className='h-4 w-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end' className='w-48'>
						{actions.map((action, index) => (
							<DropdownMenuItem key={index} asChild>
								<a
									href={action.href}
									className='flex items-center justify-between cursor-pointer'>
									{action.label}
									<ExternalLink className='h-3.5 w-3.5 ml-2' />
								</a>
							</DropdownMenuItem>
						))}
						{actions.length === 0 && (
							<>
								<DropdownMenuItem>View daily</DropdownMenuItem>
								<DropdownMenuItem>View weekly</DropdownMenuItem>
								<DropdownMenuItem>View monthly</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</CardHeader>

			{/* Card content */}
			<CardContent className='p-4 pt-0'>
				<div className='flex items-end justify-between'>
					<div>
						<div className='flex items-baseline gap-2'>
							<div className='text-2xl font-bold'>
								{isLoading ? (
									<div className='h-7 w-24 bg-muted rounded animate-pulse' />
								) : (
									value
								)}
							</div>

							{changeDisplay !== undefined && !isLoading && (
								<div
									className={cn(
										'flex items-center text-xs font-medium rounded-full px-1.5 py-0.5',
										isPositiveChange
											? 'text-success bg-success/10'
											: 'text-destructive bg-destructive/10'
									)}>
									{isPositiveChange ? (
										<ArrowUp className='h-3 w-3 mr-0.5' />
									) : (
										<ArrowDown className='h-3 w-3 mr-0.5' />
									)}
									{changeDisplay}%
								</div>
							)}
						</div>

						{description && (
							<p className='text-xs text-muted-foreground mt-1'>
								{isLoading ? (
									<div className='h-3 w-32 bg-muted rounded animate-pulse mt-2' />
								) : (
									description
								)}
							</p>
						)}
					</div>

					{data.length > 0 && !isLoading && (
						<div className='flex-none'>{renderSparkline()}</div>
					)}
				</div>
			</CardContent>

			{/* Decorative background elements */}
			<div className='absolute inset-0 pointer-events-none overflow-hidden'>
				<div
					className={cn(
						'absolute -right-6 -bottom-10 w-32 h-32 rounded-full opacity-5 bg-gradient-to-br',
						colorClasses[color]
					)}
				/>
			</div>
		</Card>
	);
}
