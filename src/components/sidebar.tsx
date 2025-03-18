'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
	ChevronLeft,
	Menu,
	LayoutDashboard,
	ShoppingCart,
	Package,
	Users,
	FileText,
	Settings,
	PieChart,
	CreditCard,
	Tags,
	Home,
	ChevronDown,
	Plus,
	LogOut,
	Bell
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { RootState } from '@/lib/redux/store';
import { fetchOrders } from '@/lib/redux/slices/orders.slice';
import { fetchItems } from '@/lib/redux/slices/items.slice';
import { fetchCurrentUser } from '@/lib/redux/slices/user.slice';

type SidebarItem = {
	title: string;
	href: string;
	icon: string;
	submenu?: { title: string; href: string; badge?: string }[];
};

const Sidebar = () => {
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(false);
	const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	// Get data from Redux store
	const dispatch = useAppDispatch();
	const { orders } = useAppSelector((state: RootState) => state.orders);
	const { items } = useAppSelector((state: RootState) => state.items);
	const { user } = useAppSelector((state: RootState) => state.user);

	// Fetch data on component mount
	useEffect(() => {
		dispatch(fetchOrders());
		dispatch(fetchItems());
		dispatch(fetchCurrentUser());
	}, [dispatch]);

	// Calculate notification counts
	const pendingOrdersCount =
		orders?.filter(order => order.status === 'PENDING')?.length || 0;
	const lowStockCount = items?.filter(item => item.quantity < 10)?.length || 0;

	const sidebarItems: SidebarItem[] = [
		{
			title: 'Dashboard',
			href: '/dashboard',
			icon: 'dashboard'
		},
		{
			title: 'Orders',
			href: '/orders',
			icon: 'cart',
			submenu: [
				{ title: 'All Orders', href: '/orders' },
				{
					title: 'Pending',
					href: '/orders/pending',
					badge: pendingOrdersCount.toString()
				},
				{ title: 'Completed', href: '/orders/completed' },
				{ title: 'Cancelled', href: '/orders/cancelled' }
			]
		},
		{
			title: 'Products',
			href: '/products',
			icon: 'package',
			submenu: [
				{ title: 'All Products', href: '/products' },
				{ title: 'Add Product', href: '/products/new' },
				{ title: 'Categories', href: '/products/categories' },
				{
					title: 'Low Stock',
					href: '/products/low-stock',
					badge: lowStockCount.toString()
				}
			]
		},
		{
			title: 'Customers',
			href: '/customers',
			icon: 'users'
		},
		{
			title: 'Analytics',
			href: '/analytics',
			icon: 'chart'
		},
		{
			title: 'Payments',
			href: '/payments',
			icon: 'creditCard'
		},
		{
			title: 'Marketing',
			href: '/marketing',
			icon: 'tag'
		},
		{
			title: 'Reports',
			href: '/reports',
			icon: 'fileText'
		},
		{
			title: 'Settings',
			href: '/settings',
			icon: 'settings'
		}
	];

	const toggleSubmenu = (title: string) => {
		if (openSubmenu === title) {
			setOpenSubmenu(null);
		} else {
			setOpenSubmenu(title);
		}
	};

	const toggleSidebar = () => {
		setCollapsed(!collapsed);
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			setIsMobileOpen(!isMobileOpen);
		}
	};

	const getIcon = (icon: string) => {
		const IconComponent =
			{
				dashboard: LayoutDashboard,
				cart: ShoppingCart,
				package: Package,
				users: Users,
				chart: PieChart,
				creditCard: CreditCard,
				tag: Tags,
				fileText: FileText,
				settings: Settings,
				home: Home
			}[icon] || Home;

		return <IconComponent className='h-5 w-5' />;
	};

	const isActive = (href: string) => {
		if (href === '/dashboard' && pathname === '/dashboard') {
			return true;
		}
		if (href !== '/dashboard' && pathname.startsWith(href)) {
			return true;
		}
		return false;
	};

	return (
		<>
			{/* Mobile Sidebar Toggle */}
			<div className='block md:hidden fixed top-4 left-4 z-50'>
				<Button
					variant='glass'
					size='icon'
					className='shadow-lg hover-scale'
					onClick={() => setIsMobileOpen(!isMobileOpen)}>
					<Menu className='h-5 w-5' />
				</Button>
			</div>

			{/* Sidebar Overlay */}
			{isMobileOpen && (
				<div
					className='md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40'
					onClick={() => setIsMobileOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					'fixed top-0 left-0 h-full bg-card/90 backdrop-blur-md border-r border-border/50 shadow-xl transition-all duration-300 ease-in-out z-50 flex flex-col',
					collapsed
						? 'w-[70px] md:w-[70px]'
						: 'w-[280px] md:w-[280px] md:translate-x-0',
					'md:relative md:translate-x-0',
					isMobileOpen && 'translate-x-0',
					!isMobileOpen && collapsed && '-translate-x-full md:translate-x-0'
				)}>
				{/* Sidebar Header */}
				<div className='flex items-center justify-between p-4 h-16 border-b border-border/50 bg-gradient-to-r from-primary/10 to-secondary/10'>
					<div className='flex items-center gap-2'>
						{!collapsed && (
							<div className='flex items-center gap-2 animate-fade-in'>
								<div className='bg-gradient-to-r from-primary to-secondary p-2 rounded-xl shadow-md'>
									<ShoppingCart className='h-5 w-5 text-white' />
								</div>
								<span className='font-bold text-lg tracking-tight text-gradient'>
									StoreFront
								</span>
							</div>
						)}
						{collapsed && (
							<div className='bg-gradient-to-r from-primary to-secondary p-2 mx-auto rounded-xl shadow-md animate-pulse-ping'>
								<ShoppingCart className='h-4 w-4 text-white' />
							</div>
						)}
					</div>
					<Button
						variant='ghost'
						size='icon'
						className='rounded-full hidden md:flex hover:bg-background/60'
						onClick={toggleSidebar}>
						<ChevronLeft
							className={cn(
								'h-4 w-4 transition-transform',
								collapsed && 'rotate-180'
							)}
						/>
					</Button>
				</div>

				{/* Sidebar Content */}
				<div className='flex-1 px-3 pt-3 pb-4 overflow-y-auto scrollbar-thin'>
					<nav className='space-y-1'>
						{sidebarItems.map((item, index) => (
							<div
								key={item.title}
								className='mb-1 animate-slide-in'
								style={{ animationDelay: `${index * 0.05}s` }}>
								{item.submenu ? (
									// With Submenu
									<div>
										<button
											className={cn(
												'flex items-center w-full p-2.5 rounded-xl text-sm font-medium transition-all',
												isActive(item.href)
													? 'bg-primary/10 text-primary shadow-sm'
													: 'text-muted-foreground hover:bg-accent/40 hover:text-foreground',
												collapsed && 'justify-center'
											)}
											onClick={() => toggleSubmenu(item.title)}>
											<div className='flex items-center'>
												<div
													className={cn(
														'mr-3 flex items-center justify-center',
														isActive(item.href)
															? 'text-primary'
															: 'text-muted-foreground',
														collapsed && 'mr-0'
													)}>
													{getIcon(item.icon)}
												</div>
												{!collapsed && <span>{item.title}</span>}
											</div>
											{!collapsed && (
												<ChevronDown
													className={cn(
														'ml-auto h-4 w-4 transition-transform',
														openSubmenu === item.title
															? 'rotate-180'
															: 'rotate-0'
													)}
												/>
											)}
										</button>
										{!collapsed && openSubmenu === item.title && (
											<div className='mt-1 ml-5 space-y-1 animate-slide-up'>
												{item.submenu.map(subitem => (
													<Link
														key={subitem.title}
														href={subitem.href}
														className={cn(
															'flex items-center justify-between p-2 pl-6 rounded-lg text-sm transition-colors',
															pathname === subitem.href
																? 'bg-primary/5 text-primary font-medium'
																: 'text-muted-foreground hover:bg-accent/30 hover:text-foreground'
														)}>
														<span>{subitem.title}</span>
														{subitem.badge && (
															<Badge
																variant='default'
																className='ml-auto animate-pulse-ping'>
																{subitem.badge}
															</Badge>
														)}
													</Link>
												))}
											</div>
										)}
									</div>
								) : (
									// Without Submenu
									<Link
										href={item.href}
										className={cn(
											'flex items-center p-2.5 rounded-xl text-sm font-medium transition-all hover-scale',
											isActive(item.href)
												? 'bg-primary/10 text-primary shadow-sm'
												: 'text-muted-foreground hover:bg-accent/40 hover:text-foreground',
											collapsed && 'justify-center p-2.5'
										)}>
										<div
											className={cn(
												'flex items-center justify-center',
												isActive(item.href) && 'text-primary'
											)}>
											{getIcon(item.icon)}
											{!collapsed && <span className='ml-3'>{item.title}</span>}
										</div>
									</Link>
								)}
							</div>
						))}
					</nav>
				</div>

				{/* Quick Actions */}
				{!collapsed && (
					<div className='pt-2 pb-4 px-3'>
						<Button
							className='w-full justify-start items-center gap-2 font-medium animate-pulse'
							variant='gradient'
							leftIcon={<Plus className='h-4 w-4' />}>
							New Order
						</Button>
					</div>
				)}

				{/* Sidebar Footer */}
				<div className='p-4 border-t border-border/50 mt-auto bg-gradient-to-r from-primary/5 to-secondary/5'>
					<div className='flex items-center gap-3'>
						<Avatar
							className={cn(
								'h-10 w-10 ring-2 ring-primary/20 shadow-sm hover-scale',
								collapsed && 'mx-auto'
							)}>
							<AvatarImage src='' alt={user?.name || 'User'} />
							<AvatarFallback className='bg-gradient-to-r from-primary to-secondary text-white'>
								{user?.name?.split(' ')[0]?.charAt(0) || 'S'}
							</AvatarFallback>
						</Avatar>
						{!collapsed && (
							<div className='flex-1 min-w-0'>
								<p className='text-sm font-medium truncate'>
									{user?.name || 'Store Manager'}
								</p>
								<p className='text-xs text-muted-foreground truncate'>
									{user?.email || 'manager@storefront.com'}
								</p>
							</div>
						)}

						{!collapsed && (
							<div className='flex gap-1'>
								<Button
									variant='ghost'
									size='icon'
									className='rounded-full h-8 w-8'>
									<Bell className='h-4 w-4' />
								</Button>
								<Button
									variant='ghost'
									size='icon'
									className='rounded-full h-8 w-8'>
									<LogOut className='h-4 w-4' />
								</Button>
							</div>
						)}
					</div>
				</div>
			</aside>
		</>
	);
};

export default Sidebar;
