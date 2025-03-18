'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Route } from 'next';

const navItems = [
	{ name: 'Dashboard', href: '/' as Route },
	{ name: 'Items', href: '/items' as Route },
	{ name: 'Orders', href: '/orders' as Route },
	{ name: 'Bills', href: '/bills' as Route },
	{ name: 'Analytics', href: '/analytics' as Route }
];

export function MainNav() {
	const pathname = usePathname();

	return (
		<nav className='flex items-center space-x-4 lg:space-x-6'>
			{navItems.map(item => (
				<Link
					key={item.href}
					href={item.href}
					className={cn(
						'text-sm font-medium transition-colors hover:text-primary',
						pathname === item.href ? 'text-primary' : 'text-muted-foreground'
					)}>
					{item.name}
				</Link>
			))}
		</nav>
	);
}
