'use client';

import React from 'react';
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
	X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavItemProps {
	href: Route;
	icon: React.ReactNode;
	title: string;
	isActive: boolean;
	onClick?: () => void;
}

function NavItem({ href, icon, title, isActive, onClick }: NavItemProps) {
	return (
		<Link
			href={href}
			onClick={onClick}
			className={cn(
				'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
				isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
			)}>
			{icon}
			<span>{title}</span>
		</Link>
	);
}

export function Sidebar() {
	const pathname = usePathname();
	const [open, setOpen] = React.useState(false);

	const routes = [
		{
			href: '/dashboard' as Route,
			icon: <LayoutDashboard className='h-4 w-4' />,
			title: 'Dashboard'
		},
		{
			href: '/items' as Route,
			icon: <ShoppingBag className='h-4 w-4' />,
			title: 'Items'
		},
		{
			href: '/orders' as Route,
			icon: <ShoppingCart className='h-4 w-4' />,
			title: 'Orders'
		},
		{
			href: '/bills' as Route,
			icon: <Receipt className='h-4 w-4' />,
			title: 'Bills'
		},
		{
			href: '/analytics' as Route,
			icon: <BarChart3 className='h-4 w-4' />,
			title: 'Analytics'
		},
		{
			href: '/settings' as Route,
			icon: <Settings className='h-4 w-4' />,
			title: 'Settings'
		}
	];

	return (
		<>
			{/* Mobile Navigation */}
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger asChild>
					<Button variant='outline' size='icon' className='md:hidden'>
						<Menu className='h-5 w-5' />
						<span className='sr-only'>Toggle Menu</span>
					</Button>
				</SheetTrigger>
				<SheetContent side='left' className='flex flex-col p-0'>
					<div className='flex items-center border-b px-6 py-4'>
						<h2 className='text-lg font-semibold'>StoreFront</h2>
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
						<div className='space-y-1'>
							{routes.map(route => (
								<NavItem
									key={route.href}
									href={route.href}
									icon={route.icon}
									title={route.title}
									isActive={pathname === route.href}
									onClick={() => setOpen(false)}
								/>
							))}
						</div>
					</nav>
				</SheetContent>
			</Sheet>

			{/* Desktop Navigation */}
			<aside className='hidden md:flex h-screen w-64 flex-col border-r'>
				<div className='flex h-14 items-center border-b px-4'>
					<h2 className='text-lg font-semibold'>StoreFront</h2>
				</div>
				<nav className='flex-1 overflow-auto p-4'>
					<div className='space-y-1'>
						{routes.map(route => (
							<NavItem
								key={route.href}
								href={route.href}
								icon={route.icon}
								title={route.title}
								isActive={pathname === route.href}
							/>
						))}
					</div>
				</nav>
			</aside>
		</>
	);
}
