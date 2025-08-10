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
	BarChart3,
	Settings,
	Menu,
	Store,
	LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetHeader,
	SheetTitle,
	SheetDescription
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';

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
				'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
				'relative overflow-hidden min-h-[48px] hover:scale-[1.02] active:scale-[0.98]',
				isActive
					? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/25'
					: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
			)}>
			<div
				className={cn(
					'flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 transition-colors',
					isActive
						? 'text-white bg-white/20'
						: 'text-gray-500 group-hover:text-gray-700 group-hover:bg-gray-200'
				)}>
				{icon}
			</div>
			<span className='flex-1 text-sm font-medium'>{title}</span>
			{badge !== undefined && badge > 0 && (
				<Badge
					variant={isActive ? 'secondary' : 'default'}
					className={cn(
						'ml-auto text-xs px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center',
						isActive
							? 'bg-white/20 text-white border-white/30'
							: 'bg-red-100 text-red-700 border-red-200'
					)}>
					{badge}
				</Badge>
			)}
		</Link>
	);
}

export function Sidebar() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	// Fix for hydration
	useEffect(() => {
		setMounted(true);
	}, []);

	const routes = [
		{
			href: '/dashboard' as Route,
			icon: <LayoutDashboard className='h-5 w-5' />,
			title: 'Dashboard',
			badge: 0
		},
		{
			href: '/items' as Route,
			icon: <ShoppingBag className='h-5 w-5' />,
			title: 'Items',
			badge: 0
		},
		{
			href: '/orders' as Route,
			icon: <ShoppingCart className='h-5 w-5' />,
			title: 'Orders',
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

	const { logout } = useAuth();

	const handleLogout = async () => {
		await logout();
	};

	if (!mounted) return null;

	return (
		<>
			{/* Mobile Navigation - Small screens */}
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger asChild>
					<Button
						variant='outline'
						size='icon'
						className='md:hidden fixed top-3 left-3 z-[60] shadow-lg bg-white/95 backdrop-blur-sm hover:bg-gray-50 border-gray-200 h-10 w-10'>
						<Menu className='h-5 w-5' />
						<span className='sr-only'>Toggle Menu</span>
					</Button>
				</SheetTrigger>
				<SheetContent
					side='left'
					className='flex flex-col p-0 w-[85%] sm:w-[300px] border-r bg-white'>
					<SheetHeader className='sr-only'>
						<SheetTitle>Navigation Menu</SheetTitle>
						<SheetDescription>Store navigation options</SheetDescription>
					</SheetHeader>
					<div className='flex items-center border-b px-6 py-4'>
						<div className='flex items-center gap-3'>
							<div className='flex items-center justify-center w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg shadow-lg'>
								<Store className='h-5 w-5 text-white' />
							</div>
							<h2 className='text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent'>
								StoreFront
							</h2>
						</div>
					</div>
					<nav className='flex-1 overflow-auto px-4 py-6'>
						<div className='space-y-2'>
							{routes.map((route) => (
								<div key={route.href} className='animate-slide-in-left'>
									<NavItem
										href={route.href}
										icon={route.icon}
										title={route.title}
										isActive={pathname === route.href}
										badge={route.badge}
										onClick={() => setOpen(false)}
									/>
								</div>
							))}
						</div>
					</nav>
					<div className='border-t bg-gray-50/50 p-4'>
						<Button
							variant='ghost'
							size='sm'
							className='w-full justify-start gap-3 hover:bg-red-50 hover:text-red-600 text-gray-600'
							onClick={() => {
								handleLogout();
								setOpen(false);
							}}>
							<LogOut className='h-4 w-4' />
							<span className='font-medium'>Sign Out</span>
						</Button>
					</div>
				</SheetContent>
			</Sheet>

			{/* Tablet Navigation - Bottom Navbar (Portrait/vertical tablet) */}
			<nav className='hidden md:flex lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg'>
				<div className='flex items-center justify-around w-full px-2 py-3'>
					{routes.map(route => (
						<Link
							key={route.href}
							href={route.href}
							className={cn(
								'flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[64px] relative transition-all duration-200',
								pathname === route.href
									? 'text-emerald-600 bg-emerald-50'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
							)}>
							<div
								className={cn(
									'flex items-center justify-center w-6 h-6 relative',
									pathname === route.href ? 'text-emerald-600' : 'text-gray-500'
								)}>
								{route.icon}
								{route.badge > 0 && (
									<Badge className='absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-red-500 text-white border-white flex items-center justify-center'>
										{route.badge > 9 ? '9+' : route.badge}
									</Badge>
								)}
							</div>
							<span className='text-xs font-medium truncate max-w-[48px]'>
								{route.title}
							</span>
						</Link>
					))}
					{/* Logout button for tablet */}
					<button
						onClick={handleLogout}
						className='flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[64px] text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200'>
						<LogOut className='w-6 h-6' />
						<span className='text-xs font-medium'>Logout</span>
					</button>
				</div>
			</nav>

			{/* Desktop Navigation - Floating Sidebar (Landscape tablet and desktop) */}
			<aside className='hidden lg:flex flex-col w-64 xl:w-72 h-[calc(100vh-2rem)] m-4 rounded-2xl bg-white shadow-lg border border-gray-100 fixed top-0 left-0 z-40'>
				<div className='flex h-16 xl:h-20 items-center border-b px-6'>
					<div className='flex items-center gap-3'>
						<div className='flex items-center justify-center w-8 h-8 xl:w-10 xl:h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg shadow-lg'>
							<Store className='h-5 w-5 xl:h-6 xl:w-6 text-white' />
						</div>
						<h2 className='text-xl xl:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent'>
							StoreFront
						</h2>
					</div>
				</div>

				<nav className='flex-1 px-4 py-6 overflow-y-auto'>
					<div className='space-y-2'>
						{routes.map(route => (
							<div key={route.href} className='animate-slide-in-left'>
								<NavItem
									href={route.href}
									icon={route.icon}
									title={route.title}
									isActive={pathname === route.href}
									badge={route.badge}
								/>
							</div>
						))}
					</div>
				</nav>

				<div className='border-t bg-gray-50/50 p-4'>
					<Button
						variant='ghost'
						size='sm'
						className='w-full justify-start gap-3 hover:bg-red-50 hover:text-red-600 text-gray-600'
						onClick={handleLogout}>
						<LogOut className='h-4 w-4' />
						<span className='font-medium'>Sign Out</span>
					</Button>
				</div>
			</aside>
		</>
	);
}
