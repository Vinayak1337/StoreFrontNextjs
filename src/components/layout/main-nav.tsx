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
	Settings,
	Search,
	Bell,
	Plus,
	User,
	LogOut
} from 'lucide-react';
import { Input } from '@/components/ui/input';
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
	const pendingOrdersCount =
		orders?.filter(order => order?.status === 'PENDING')?.length || 0;
	const lowStockCount =
		items?.filter(item => item?.inStock === false)?.length || 0;
	const unreadBillsCount = bills?.length || 0;
	const totalNotifications =
		pendingOrdersCount + lowStockCount + unreadBillsCount;

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
			badge: unreadBillsCount
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
			<nav className='flex gap-1 items-center'>
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

			<div className='flex items-center gap-2 md:gap-3'>
				<div className='relative w-full md:w-64 mr-1 md:mr-2'>
					<div className='absolute left-2.5 top-2.5 text-muted-foreground'>
						<Search className='h-4 w-4' />
					</div>
					<Input
						placeholder='Search...'
						className='pl-9 pr-4 w-full h-9 rounded-full bg-muted focus-visible:bg-accent/20 focus-visible:border-primary/30 transition-colors hover:bg-muted/70'
					/>
				</div>

				<Button
					variant='ghost'
					size='icon'
					className='rounded-full hover:bg-accent/50 relative'>
					<Bell className='h-5 w-5' />
					{totalNotifications > 0 && (
						<span className='absolute top-0 right-0 h-2 w-2 bg-primary rounded-full animate-pulse'></span>
					)}
				</Button>

				<Button
					variant='gradient'
					size='sm'
					className='hidden md:flex items-center gap-1'>
					<Plus className='h-3.5 w-3.5' />
					<span>New</span>
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant='ghost'
							size='icon'
							className='rounded-full p-0 hover-scale'>
							<Avatar className='h-9 w-9 shadow-sm border-2 border-border'>
								<AvatarImage src='' alt={user?.name || 'Store Manager'} />
								<AvatarFallback className='bg-gradient-to-r from-primary to-secondary text-primary-foreground'>
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
						<DropdownMenuItem className='cursor-pointer'>
							<User className='mr-2 h-4 w-4' />
							<span>Profile</span>
						</DropdownMenuItem>
						<DropdownMenuItem className='cursor-pointer'>
							<Settings className='mr-2 h-4 w-4' />
							<span>Settings</span>
						</DropdownMenuItem>
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
