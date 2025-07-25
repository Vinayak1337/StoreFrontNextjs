'use client';

import Link from 'next/link';
import { MainNav } from './main-nav';
import { ShoppingCart } from 'lucide-react';

export function Header() {
	return (
		<header className='sticky top-0 z-40 w-full border-b border-border/30 backdrop-blur-md bg-background/80 shadow-sm'>
			<div className='container flex h-16 items-center justify-between'>
				<div className='flex gap-6 md:gap-10 items-center'>
					<Link href='/' className='flex items-center space-x-2 hover-scale'>
						<div className='bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-xl shadow-md'>
							<ShoppingCart className='h-5 w-5 text-white' />
						</div>
						<span className='inline-block font-bold text-lg tracking-tight text-gradient'>
							StoreFront
						</span>
					</Link>
					<MainNav />
				</div>
				<div className='flex flex-1 items-center justify-end space-x-4'>
					<nav className='flex items-center space-x-1'>
						{/* Add user menu or other header items here */}
					</nav>
				</div>
			</div>
		</header>
	);
}
