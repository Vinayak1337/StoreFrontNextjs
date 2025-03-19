'use client';

import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/lib/redux/store';
import { Sidebar } from '@/components/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { ReactQueryProvider } from '@/lib/providers/query-provider';
import { TopNavbar } from '@/components/layout/top-navbar';
import { cn } from '@/lib/utils';
import { ToastProvider } from '@/components/toast-provider';

export default function ClientWrapper({
	children
}: {
	children: React.ReactNode;
}) {
	const [mounted, setMounted] = useState(false);

	// Hydration fix and allows for animation on first load
	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<ThemeProvider attribute='class' defaultTheme='light'>
			<ReactQueryProvider>
				<Provider store={store}>
					<div
						className={cn(
							'flex min-h-screen overflow-hidden',
							mounted ? 'animate-fade-in' : 'opacity-0'
						)}>
						{/* Sidebar navigation */}
						<Sidebar />

						{/* Main content area with header and content */}
						<div className='flex-1 flex flex-col overflow-hidden'>
							{/* Top navigation bar */}
							<TopNavbar />

							{/* Main scrollable content */}
							<main className='flex-1 overflow-auto'>
								<div className='px-6 py-6 h-full animate-slide-in'>
									{children}
								</div>
							</main>
						</div>
					</div>
					<ToastProvider />
				</Provider>
			</ReactQueryProvider>
		</ThemeProvider>
	);
}
