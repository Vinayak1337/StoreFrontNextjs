'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TopNavbarProps {
	className?: string;
}

export function TopNavbar({ className }: TopNavbarProps) {
	return (
		<header className={cn('border-b bg-background', className)}>
			<nav className='container flex h-16 items-center px-4'>
				<div className='mr-4 flex md:mr-6'>
					<Link href='/' className='flex items-center space-x-2'>
						<span className='hidden font-bold sm:inline-block'>StoreFront</span>
					</Link>
				</div>
				<div className='flex-1'></div>
				<div className='flex items-center gap-2'>
					<div className='relative'>
						<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
						<input
							type='search'
							placeholder='Search...'
							className='h-9 rounded-md border border-input bg-background pl-8 pr-2 text-sm'
						/>
					</div>
					<button className='inline-flex h-9 w-9 items-center justify-center rounded-full border'>
						<Bell className='h-4 w-4' />
						<span className='sr-only'>Notifications</span>
					</button>
					<button className='inline-flex h-9 w-9 items-center justify-center rounded-full border'>
						<User className='h-4 w-4' />
						<span className='sr-only'>Account</span>
					</button>
				</div>
			</nav>
		</header>
	);
}
