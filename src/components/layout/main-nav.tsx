'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Route } from 'next';
import {
	Home,
	Package,
	ShoppingCart,
	CreditCard,
	BarChart,
	LogOut
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { RootState } from '@/lib/redux/store';
import { fetchItems } from '@/lib/redux/slices/items.slice';
import { fetchOrders } from '@/lib/redux/slices/orders.slice';
import { fetchBills } from '@/lib/redux/slices/bills.slice';
import { fetchCurrentUser } from '@/lib/redux/slices/user.slice';

export function MainNav() {
	const pathname = usePathname();
	const router = useRouter();

	// Connect to Redux store
	const dispatch = useAppDispatch();
	const { items } = useAppSelector((state: RootState) => state.items);
	const { orders } = useAppSelector((state: RootState) => state.orders);
	const { bills } = useAppSelector((state: RootState) => state.bills);
	const { user } = useAppSelector((state: RootState) => state.user);

	// Fetch data on component mount
	useEffect(() => {
		dispatch(fetchItems());
		dispatch(fetchOrders());
		dispatch(fetchBills());
		dispatch(fetchCurrentUser());
	}, [dispatch]);

	// Calculate notification counts with null checks
	const pendingOrdersCount = orders?.filter(order => !order?.bill)?.length || 0;
	const lowStockCount =
		items?.filter(item => item?.inStock === false)?.length || 0;
	const unpaidBillsCount = bills?.filter(bill => !bill?.isPaid)?.length || 0;

	const navItems = [
		{
			name: 'Dashboard',
			href: '/dashboard' as Route,
			icon: <Home className='h-4 w-4' />,
			badge: 0
		},
		{
			name: 'Items',
			href: '/items' as Route,
			icon: <Package className='h-4 w-4' />,
			badge: lowStockCount
		},
		{
			name: 'Orders',
			href: '/orders' as Route,
			icon: <ShoppingCart className='h-4 w-4' />,
			badge: pendingOrdersCount
		},
		{
			name: 'Bills',
			href: '/bills' as Route,
			icon: <CreditCard className='h-4 w-4' />,
			badge: unpaidBillsCount
		},
		{
			name: 'Analytics',
			href: '/analytics' as Route,
			icon: <BarChart className='h-4 w-4' />,
			badge: 0
		}
	];

	const handleLogout = async () => {
		try {
			const response = await fetch('/api/auth/logout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				// Redirect to login page
				router.push('/');
			}
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	return (
		<div className='flex items-center justify-between w-full'>
			<nav className='flex gap-1 items-center pl-12 xl:pl-0'>
				{navItems.map((item, index) => (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							'flex items-center px-2 md:px-3 py-2 text-sm font-medium rounded-xl transition-all hover-scale whitespace-nowrap',
							pathname === item.href
								? 'bg-primary/10 text-primary'
								: 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
						)}
						style={{ animationDelay: `${index * 0.05}s` }}>
						<span className='flex items-center justify-center mr-1.5'>
							{item.icon}
						</span>
						<span>{item.name}</span>
						{item.badge > 0 && (
							<Badge
								variant='secondary'
								className='ml-1.5 animate-pulse-ping scale-90'>
								{item.badge}
							</Badge>
						)}
					</Link>
				))}
			</nav>

			<div className='flex items-center gap-2'>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant='ghost'
							size='icon'
							className='rounded-full p-0 hover-scale'>
							<Avatar className='h-9 w-9 shadow-sm border-2 border-border'>
								<AvatarImage src='' alt={user?.name || 'Store Manager'} />
								<AvatarFallback className='bg-gradient-to-r from-emerald-600 to-emerald-700 text-white'>
									{user?.name?.split(' ')?.[0]?.charAt(0) || 'S'}
								</AvatarFallback>
							</Avatar>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end' className='w-56 animate-scale'>
						<DropdownMenuLabel>
							{user?.name || 'Store Manager'}
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem className='cursor-pointer' onClick={handleLogout}>
							<LogOut className='mr-2 h-4 w-4' />
							<span>Log out</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
