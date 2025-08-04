'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Route } from 'next';
import {
	Home,
	Package,
	ShoppingCart,
	BarChart,
	LogOut
} from 'lucide-react';
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

export function MainNav() {
	const pathname = usePathname();
	const router = useRouter();

	const navItems = [
		{
			name: 'Dashboard',
			href: '/dashboard' as Route,
			icon: <Home className='h-4 w-4' />
		},
		{
			name: 'Items',
			href: '/items' as Route,
			icon: <Package className='h-4 w-4' />
		},
		{
			name: 'Orders',
			href: '/orders' as Route,
			icon: <ShoppingCart className='h-4 w-4' />
		},
		{
			name: 'Analytics',
			href: '/analytics' as Route,
			icon: <BarChart className='h-4 w-4' />
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
								<AvatarImage src='' alt='Store Manager' />
								<AvatarFallback className='bg-gradient-to-r from-emerald-600 to-emerald-700 text-white'>
									S
								</AvatarFallback>
							</Avatar>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end' className='w-56 animate-scale'>
						<DropdownMenuLabel>
							Store Manager
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
