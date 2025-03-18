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
	Sun,
	Moon,
	Store,
	LogOut,
	Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from '@/components/ui/tooltip';

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
				'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
				'hover-scale hover:bg-primary/10',
				isActive
					? 'bg-primary text-primary-foreground dark:bg-primary/70'
					: 'text-muted-foreground hover:text-foreground'
			)}>
			<div
				className={cn(
					'flex h-7 w-7 items-center justify-center rounded-md',
					isActive
						? 'text-primary-foreground'
						: 'text-muted-foreground group-hover:text-foreground'
				)}>
				{icon}
			</div>
			<span className='flex-1'>{title}</span>
			{badge !== undefined && badge > 0 && (
				<Badge variant='secondary' className='animate-scale ml-auto'>
					{badge}
				</Badge>
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
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Fix for hydration
	useEffect(() => {
		setMounted(true);
	}, []);

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
			title: 'Items',
			badge: 3
		},
		{
			href: '/orders' as Route,
			icon: <ShoppingCart className='h-5 w-5' />,
			title: 'Orders',
			badge: 5
		},
		{
			href: '/bills' as Route,
			icon: <Receipt className='h-5 w-5' />,
			title: 'Bills',
			badge: 0
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
						className='md:hidden fixed top-4 left-4 z-50'>
						<Menu className='h-5 w-5' />
						<span className='sr-only'>Toggle Menu</span>
					</Button>
				</SheetTrigger>
				<SheetContent side='left' className='flex flex-col p-0'>
					<div className='flex items-center border-b px-6 py-4'>
						<div className='flex items-center gap-2'>
							<Store className='h-6 w-6 text-primary' />
							<h2 className='text-lg font-semibold'>StoreFront</h2>
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
					<nav className='flex-1 overflow-auto p-4'>
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
					<div className='border-t px-6 py-3'>
						<div className='flex items-center justify-between'>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
								{theme === 'dark' ? (
									<Sun className='h-5 w-5' />
								) : (
									<Moon className='h-5 w-5' />
								)}
								<span className='sr-only'>Toggle theme</span>
							</Button>
							<Button variant='ghost' size='icon'>
								<Bell className='h-5 w-5' />
								<span className='sr-only'>Notifications</span>
							</Button>
							<Button variant='ghost' size='icon'>
								<LogOut className='h-5 w-5 text-destructive' />
								<span className='sr-only'>Log out</span>
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>

			{/* Desktop Navigation */}
			<aside className='hidden md:flex flex-col w-64 h-screen border-r animate-slide-in'>
				<div className='flex h-14 items-center border-b px-4'>
					<div className='flex items-center gap-2'>
						<Store className='h-6 w-6 text-primary' />
						<h2 className='text-lg font-semibold'>StoreFront</h2>
					</div>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant='ghost'
									size='icon'
									className='ml-auto'
									onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
									{theme === 'dark' ? (
										<Sun className='h-4 w-4' />
									) : (
										<Moon className='h-4 w-4' />
									)}
									<span className='sr-only'>Toggle theme</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Toggle theme</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<nav className='flex-1 overflow-auto p-4'>
					<div className='space-y-2'>
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
				</nav>
				<div className='border-t p-4'>
					<div className='flex items-center justify-between'>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant='ghost' size='icon'>
										<Bell className='h-5 w-5' />
										<span className='sr-only'>Notifications</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Notifications</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant='ghost' size='icon'>
										<LogOut className='h-5 w-5 text-destructive' />
										<span className='sr-only'>Log out</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Log out</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>
			</aside>
		</>
	);
}
