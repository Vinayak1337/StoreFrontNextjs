'use client';

import Link from 'next/link';
import { MainNav } from './main-nav';

export function Header() {
	return (
		<header className='sticky top-0 z-40 w-full border-b bg-background'>
			<div className='container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0'>
				<div className='flex gap-6 md:gap-10'>
					<Link href='/' className='flex items-center space-x-2'>
						<span className='inline-block font-bold'>StoreFront</span>
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
