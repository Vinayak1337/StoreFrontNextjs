'use client';

import { useState } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import Link from 'next/link';
import { format } from 'date-fns';
import {
	MoreHorizontal,
	ArrowUpRight,
	Clock,
	CheckCircle2,
	AlertCircle,
	Search,
	Filter,
	FileDown,
	ShoppingCart
} from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types';
import { RootState } from '@/lib/redux/store';

interface RecentOrdersProps {
	limit?: number;
	variant?: 'default' | 'glass' | 'gradient';
}

export function RecentOrders({
	limit = 5,
	variant = 'default'
}: RecentOrdersProps) {
	const { orders, loading } = useAppSelector(
		(state: RootState) => state.orders
	);
	const [searchTerm, setSearchTerm] = useState('');

	// Convert variant prop to glass/gradient props
	const isGlass = variant === 'glass';
	const isGradient = variant === 'gradient';

	const getStatusColor = (status: OrderStatus) => {
		switch (status) {
			case OrderStatus.COMPLETED:
				return 'success';
			case OrderStatus.PENDING:
				return 'secondary';
			case OrderStatus.CANCELLED:
				return 'destructive';
			default:
				return 'default';
		}
	};

	const getStatusIcon = (status: OrderStatus) => {
		switch (status) {
			case OrderStatus.COMPLETED:
				return <CheckCircle2 className='h-3.5 w-3.5' />;
			case OrderStatus.PENDING:
				return <Clock className='h-3.5 w-3.5' />;
			case OrderStatus.CANCELLED:
				return <AlertCircle className='h-3.5 w-3.5' />;
			default:
				return null;
		}
	};

	// Filter and limit orders
	const recentOrders = orders
		.filter(
			order =>
				order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				order.id.toString().includes(searchTerm)
		)
		.slice(0, limit);

	return (
		<Card
			className={cn(
				'animate-fade-in col-span-full',
				isGlass && 'bg-card/60 backdrop-blur-md',
				isGradient && 'bg-gradient-to-br from-card/80 to-card'
			)}>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<div>
					<CardTitle className='text-lg font-medium flex items-center gap-2'>
						<span className='flex items-center gap-2'>
							<div className='icon-container'>
								<ShoppingCart className='h-5 w-5 text-primary' />
							</div>
							Recent Orders
						</span>
					</CardTitle>
					<CardDescription className='mt-1'>
						Showing the {limit} most recent orders
					</CardDescription>
				</div>
				<div className='flex items-center gap-2'>
					<div className='relative w-40 md:w-64'>
						<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
						<input
							type='search'
							placeholder='Search orders...'
							className='w-full rounded-md border border-input bg-background pl-8 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
						/>
					</div>
					<Button
						variant='outline'
						size='icon'
						className='rounded-md'
						title='Filter'>
						<Filter className='h-4 w-4' />
					</Button>
					<Button
						variant='outline'
						size='icon'
						className='rounded-md'
						title='Export'>
						<FileDown className='h-4 w-4' />
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className='flex flex-col gap-2 animate-pulse'>
						{[...Array(limit)].map((_, i) => (
							<div
								key={i}
								className='flex items-center justify-between p-3 border border-border rounded-lg'>
								<div className='flex items-center gap-3'>
									<div className='h-9 w-9 rounded-full bg-muted'></div>
									<div className='space-y-2'>
										<div className='h-3 w-32 bg-muted rounded'></div>
										<div className='h-2 w-24 bg-muted rounded'></div>
									</div>
								</div>
								<div className='h-6 w-16 rounded-full bg-muted'></div>
								<div className='h-3 w-16 bg-muted rounded'></div>
							</div>
						))}
					</div>
				) : recentOrders.length === 0 ? (
					<div className='flex flex-col items-center justify-center py-10 text-muted-foreground'>
						<ShoppingCart className='h-12 w-12 mb-3 opacity-20' />
						<p className='text-lg font-medium'>No orders found</p>
						<p className='text-sm mt-1'>
							{searchTerm
								? 'Try a different search term'
								: "Orders will appear here once they're placed"}
						</p>
					</div>
				) : (
					<div className='space-y-2'>
						{recentOrders.map((order, index) => (
							<div
								key={order.id}
								className={cn(
									'group flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors',
									'animate-fade-in'
								)}
								style={{ animationDelay: `${index * 100}ms` }}>
								<div className='flex items-center gap-3'>
									<Avatar className='h-9 w-9 border border-border'>
										<AvatarFallback className='bg-primary/10 text-primary'>
											{order.customerName.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className='flex items-center'>
											<p className='font-medium text-sm'>
												{order.customerName}
											</p>
											<p className='text-xs text-muted-foreground ml-2'>
												#{order.id.toString().padStart(4, '0')}
											</p>
										</div>
										<div className='flex items-center mt-1'>
											<p className='text-xs text-muted-foreground'>
												{format(new Date(order.createdAt), 'PPP')} ·{' '}
												{order.orderItems.length} item
												{order.orderItems.length !== 1 ? 's' : ''}
											</p>
										</div>
									</div>
								</div>

								<div className='flex items-center gap-3 mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end'>
									<Badge
										variant={getStatusColor(order.status)}
										className='capitalize flex items-center gap-1'>
										<span className='flex items-center gap-1'>
											{getStatusIcon(order.status)}
											{order.status.toLowerCase()}
										</span>
									</Badge>

									<p className='text-sm font-medium'>
										${order.bill?.totalAmount.toFixed(2) || '0.00'}
									</p>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant='ghost'
												size='icon'
												className='rounded-full h-8 w-8'>
												<MoreHorizontal className='h-4 w-4' />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='end'>
											<DropdownMenuItem asChild>
												<Link
													href={`/orders/${order.id}`}
													className='flex items-center justify-between w-full'>
													<span className='flex items-center justify-between w-full'>
														View Details
														<ArrowUpRight className='h-3.5 w-3.5 ml-2' />
													</span>
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem>Process Order</DropdownMenuItem>
											<DropdownMenuItem>Contact Customer</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
			<CardFooter className='flex items-center justify-between border-t border-border/50 pt-4'>
				<p className='text-sm text-muted-foreground'>
					Showing {recentOrders.length} of {orders.length} orders
				</p>
				<Button asChild variant='outline' size='sm' className='gap-1'>
					<Link href='/orders'>
						<span className='flex items-center'>
							View All Orders
							<ArrowUpRight className='h-3.5 w-3.5 ml-1' />
						</span>
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
