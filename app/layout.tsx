'use client';

import React from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import { Provider } from 'react-redux';
import { store } from '@/lib/redux/store';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={inter.className}>
				<Provider store={store}>
					<div className='flex min-h-screen overflow-hidden'>
						<aside className='dark h-full hidden w-full max-w-xs flex-col bg-muted p-4 md:flex'>
							<h2 className='mb-4 text-lg font-semibold tracking-tight'>
								StoreFront
							</h2>
							<nav className='space-y-1'>
								<a
									href='/dashboard'
									className='flex h-10 w-full items-center rounded-md px-4 hover:bg-accent'>
									Dashboard
								</a>
								<a
									href='/items'
									className='flex h-10 w-full items-center rounded-md px-4 hover:bg-accent'>
									Items
								</a>
								<a
									href='/orders'
									className='flex h-10 w-full items-center rounded-md px-4 hover:bg-accent'>
									Orders
								</a>
								<a
									href='/bills'
									className='flex h-10 w-full items-center rounded-md px-4 hover:bg-accent'>
									Bills
								</a>
								<a
									href='/analytics'
									className='flex h-10 w-full items-center rounded-md px-4 hover:bg-accent'>
									Analytics
								</a>
							</nav>
						</aside>
						<main className='flex-1'>{children}</main>
					</div>
				</Provider>
			</body>
		</html>
	);
}
