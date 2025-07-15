'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MainNav } from './main-nav';

export interface TopNavbarProps {
	className?: string;
}

export function TopNavbar({ className }: TopNavbarProps) {
	return (
		<header
			className={cn('border-b bg-background sticky top-0 z-10', className)}>
			<div className='flex h-14 sm:h-16 items-center px-3 sm:px-4 md:px-6 content-padding max-w-[1600px] mx-auto'>
				<div className='hidden md:flex md:flex-1'>
					<MainNav />
				</div>

				<div className='flex items-center md:hidden'>
					<Link
						href='/'
						className='flex items-center ml-12 sm:ml-14 md:ml-16 header-title'>
						<span className='font-bold text-base sm:text-lg'>StoreFront</span>
					</Link>
				</div>

				<div className='md:hidden flex-1'></div>
			</div>
		</header>
	);
}
