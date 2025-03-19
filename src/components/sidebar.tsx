'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Route } from 'next';
import {
	LayoutDashboard,
	ShoppingBag,
	ShoppingCart,
	Receipt,
	BarChart3,
	Settings,
	Menu,
	X,
	ChevronRight,
	Store,
	LogOut,
	Bell,
	Search,
	User,
	HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { RootState } from '@/lib/redux/store';
import { fetchItems } from '@/lib/redux/slices/items.slice';
import { fetchOrders } from '@/lib/redux/slices/orders.slice';
import { fetchBills } from '@/lib/redux/slices/bills.slice';

interface NavItemProps {
	href: Route;
	icon: React.ReactNode;
	title: string;
	isActive: boolean;
	onClick?: () => void;
	badge?: number;
}

function NavItem({
	href,
	icon,
	title,
	isActive,
	onClick,
	badge
}: NavItemProps) {
	return (
		<Link
			href={href}
			onClick={onClick}
			className={cn(
				'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
				'hover-scale relative overflow-hidden',
				isActive
					? 'bg-primary text-primary-foreground shadow-md'
					: 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
			)}>
			<div
				className={cn(
					'flex h-8 w-8 items-center justify-center rounded-md',
					isActive
						? 'text-primary-foreground'
						: 'text-muted-foreground group-hover:text-foreground'
				)}>
				{icon}
			</div>
			<span className='flex-1'>{title}</span>
			{badge !== undefined && badge > 0 && (
				<Badge variant='secondary' className='animate-pulse-ping ml-auto'>
					{badge}
				</Badge>
			)}
			{isActive && (
				<div className='absolute inset-y-0 left-0 w-1 bg-primary-foreground rounded-full'></div>
			)}
			<ChevronRight
				className={cn(
					'ml-auto h-4 w-4 opacity-0 transition-all',
					isActive ? 'opacity-100' : 'group-hover:opacity-30'
				)}
			/>
		</Link>
	);
}

export function Sidebar() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	// Connect to Redux store
	const dispatch = useAppDispatch();
	const { items } = useAppSelector((state: RootState) => state.items);
	const { orders } = useAppSelector((state: RootState) => state.orders);
	const { bills } = useAppSelector((state: RootState) => state.bills);

	// Fix for hydration
	useEffect(() => {
		setMounted(true);
	}, []);

	// Fetch data on component mount
	useEffect(() => {
		dispatch(fetchItems());
		dispatch(fetchOrders());
		dispatch(fetchBills());
	}, [dispatch]);

	// Calculate notification counts with null checks
	const pendingOrdersCount =
		orders?.filter(order => order?.status === 'PENDING')?.length || 0;
	const lowStockCount = items?.filter(item => item?.quantity < 10)?.length || 0;
	const unpaidBillsCount = bills?.filter(bill => !bill?.isPaid)?.length || 0;

	const routes = [
		{
			href: '/' as Route,
			icon: <LayoutDashboard className='h-5 w-5' />,
			title: 'Dashboard',
			badge: 0
		},
		{
			href: '/items' as Route,
			icon: <ShoppingBag className='h-5 w-5' />,
			title: 'Inventory',
			badge: lowStockCount
		},
		{
			href: '/orders' as Route,
			icon: <ShoppingCart className='h-5 w-5' />,
			title: 'Orders',
			badge: pendingOrdersCount
		},
		{
			href: '/bills' as Route,
			icon: <Receipt className='h-5 w-5' />,
			title: 'Invoices',
			badge: unpaidBillsCount
		},
		{
			href: '/analytics' as Route,
			icon: <BarChart3 className='h-5 w-5' />,
			title: 'Analytics',
			badge: 0
		},
		{
			href: '/settings' as Route,
			icon: <Settings className='h-5 w-5' />,
			title: 'Settings',
			badge: 0
		}
	];

	if (!mounted) return null;

	return (
		<>
			{/* Mobile Navigation */}
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger asChild>
					<Button
						variant='outline'
						size='icon'
						className='lg:hidden fixed top-4 left-4 z-50 glassmorphism hover-glow'>
						<Menu className='h-5 w-5' />
						<span className='sr-only'>Toggle Menu</span>
					</Button>
				</SheetTrigger>
				<SheetContent
					side='left'
					className='flex flex-col p-0 w-[80%] sm:w-[300px]'>
					<div className='flex items-center border-b px-6 py-4'>
						<div className='flex items-center gap-2'>
							<div className='icon-container'>
								<Store className='h-6 w-6 text-primary' />
							</div>
							<h2 className='text-lg font-semibold text-gradient'>
								StoreFront
							</h2>
						</div>
						<Button
							variant='ghost'
							size='icon'
							className='ml-auto'
							onClick={() => setOpen(false)}>
							<X className='h-5 w-5' />
							<span className='sr-only'>Close</span>
						</Button>
					</div>
					<div className='p-4'>
						<div className='relative mb-4'>
							<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
							<Input
								type='search'
								placeholder='Search...'
								className='pl-9 bg-muted/50'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>
					<nav className='flex-1 overflow-auto px-4'>
						<div className='space-y-2'>
							{routes.map(route => (
								<NavItem
									key={route.href}
									href={route.href}
									icon={route.icon}
									title={route.title}
									isActive={pathname === route.href}
									badge={route.badge}
									onClick={() => setOpen(false)}
								/>
							))}
						</div>
					</nav>
					<div className='border-t px-6 py-4'>
						<div className='flex items-center justify-between'>
							<Button variant='outline' size='icon' className='hover-rotate'>
								<Bell className='h-5 w-5 text-primary' />
								<span className='sr-only'>Notifications</span>
							</Button>
							<Button variant='outline' size='icon' className='hover-rotate'>
								<User className='h-5 w-5 text-secondary' />
								<span className='sr-only'>Profile</span>
							</Button>
							<Button variant='outline' size='icon' className='hover-rotate'>
								<LogOut className='h-5 w-5 text-destructive' />
								<span className='sr-only'>Log out</span>
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>

			{/* Desktop Navigation */}
			<aside className='hidden lg:flex flex-col w-64 h-screen border-r animate-slide-in glassmorphism'>
				<div className='flex h-16 items-center border-b px-6'>
					<div className='flex items-center gap-2'>
						<div className='icon-container animate-pulse-ping'>
							<Store className='h-6 w-6 text-primary' />
						</div>
						<h2 className='text-xl font-bold text-gradient'>StoreFront</h2>
					</div>
				</div>

				<div className='px-4 py-3'>
					<div className='relative'>
						<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
						<Input
							type='search'
							placeholder='Search...'
							className='pl-9 bg-muted/50'
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>

				<nav className='flex-1 overflow-auto p-4'>
					<div className='space-y-1.5'>
						{routes.map(route => (
							<NavItem
								key={route.href}
								href={route.href}
								icon={route.icon}
								title={route.title}
								isActive={pathname === route.href}
								badge={route.badge}
							/>
						))}
					</div>

					<div className='divider'></div>

					<div className='mt-4'>
						<h3 className='text-xs uppercase font-semibold text-muted-foreground mb-2 px-3'>
							Support
						</h3>
						<Link
							href='#'
							className='group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-primary/10'>
							<div className='flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground'>
								<HelpCircle className='h-5 w-5' />
							</div>
							<span className='flex-1'>Help Center</span>
						</Link>
					</div>
				</nav>

				<div className='border-t p-4'>
					<div className='flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-muted/50 transition-colors'>
						<div className='flex h-9 w-9 items-center justify-center rounded-full bg-secondary/10'>
							<User className='h-5 w-5 text-secondary' />
						</div>
						<div className='flex-1 min-w-0'>
							<p className='text-sm font-medium'>Admin User</p>
							<p className='text-xs text-muted-foreground truncate'>
								admin@example.com
							</p>
						</div>
						<Button variant='ghost' size='icon' className='hover-rotate'>
							<LogOut className='h-4 w-4 text-muted-foreground' />
						</Button>
					</div>
				</div>
			</aside>
		</>
	);
}
