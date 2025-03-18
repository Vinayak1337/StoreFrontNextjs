'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Route } from 'next';
import {
	Home,
	Package,
	ShoppingCart,
	CreditCard,
	BarChart,
	Settings,
	Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navItems = [
	{
		name: 'Dashboard',
		href: '/' as Route,
		icon: <Home className='mr-2 h-4 w-4' />,
		badge: 0
	},
	{
		name: 'Items',
		href: '/items' as Route,
		icon: <Package className='mr-2 h-4 w-4' />,
		badge: 3
	},
	{
		name: 'Orders',
		href: '/orders' as Route,
		icon: <ShoppingCart className='mr-2 h-4 w-4' />,
		badge: 5
	},
	{
		name: 'Bills',
		href: '/bills' as Route,
		icon: <CreditCard className='mr-2 h-4 w-4' />,
		badge: 0
	},
	{
		name: 'Analytics',
		href: '/analytics' as Route,
		icon: <BarChart className='mr-2 h-4 w-4' />,
		badge: 0
	}
];

export function MainNav() {
	const pathname = usePathname();

	return (
		<div className='flex items-center justify-between w-full'>
			<nav className='hidden md:flex items-center space-x-1'>
				{navItems.map(item => (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all hover-scale',
							pathname === item.href
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
						)}>
						{item.icon}
						<span>{item.name}</span>
						{item.badge > 0 && (
							<Badge variant='secondary' className='ml-2 animate-scale'>
								{item.badge}
							</Badge>
						)}
					</Link>
				))}
			</nav>

			<div className='flex items-center gap-4'>
				<div className='relative w-64 mr-4'>
					<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
					<Input
						placeholder='Search...'
						className='pl-8 pr-4 w-full h-9 rounded-full bg-muted focus-visible:bg-background'
					/>
				</div>

				<Button variant='outline' size='sm' className='hidden md:flex'>
					<Settings className='mr-2 h-4 w-4' />
					Settings
				</Button>

				<Avatar className='hover-scale cursor-pointer'>
					<AvatarImage src='https://github.com/shadcn.png' alt='@user' />
					<AvatarFallback>JD</AvatarFallback>
				</Avatar>
			</div>
		</div>
	);
}
