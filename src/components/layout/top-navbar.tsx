'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MainNav } from './main-nav';
import { Button } from '@/components/ui/button';

export interface TopNavbarProps {
	className?: string;
}

export function TopNavbar({ className }: TopNavbarProps) {
	return (
		<header
			className={cn('border-b bg-background sticky top-0 z-10', className)}>
			<div className='container flex h-16 items-center px-4 md:px-6'>
				<div className='hidden lg:flex'>
					<MainNav />
				</div>

				<div className='flex items-center lg:hidden'>
					<Link href='/' className='flex items-center'>
						<span className='font-bold text-lg mr-4'>StoreFront</span>
					</Link>
				</div>

				<div className='flex-1'></div>

				<div className='flex items-center gap-2'>
					<Button
						variant='ghost'
						size='icon'
						className='rounded-full hover:bg-accent/50 relative'>
						<Bell className='h-5 w-5' />
						<span className='absolute top-0 right-0 h-2 w-2 bg-primary rounded-full animate-pulse'></span>
						<span className='sr-only'>Notifications</span>
					</Button>

					<Button
						variant='ghost'
						size='icon'
						className='rounded-full hover:bg-accent/50'>
						<User className='h-5 w-5' />
						<span className='sr-only'>Account</span>
					</Button>
				</div>
			</div>
		</header>
	);
}
