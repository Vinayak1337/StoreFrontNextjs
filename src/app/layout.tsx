'use client';

import React, { useState, useEffect } from 'react';
import './globals.css';
import { Inter as FontSans } from 'next/font/google';
import { Provider } from 'react-redux';
import { store } from '@/lib/redux/store';
import { Sidebar } from '@/components/layout/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { ReactQueryProvider } from '@/lib/providers/query-provider';
import { cn } from '@/lib/utils';
import { ToastProvider } from '@/components/toast-provider';

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans'
});

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [mounted, setMounted] = useState(false);

	// Hydration fix and allows for animation on first load
	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<html lang='en' suppressHydrationWarning>
			<head>
				<title>StoreFront - Modern Inventory Management</title>
				<meta
					name='description'
					content='A modern, vibrant inventory management system'
				/>
				<link rel='icon' href='/favicon.ico' />
			</head>
			<body
				className={cn(
					'min-h-screen bg-background font-sans antialiased',
					fontSans.variable
				)}>
				<ThemeProvider attribute='class' defaultTheme='system' enableSystem>
					<ReactQueryProvider>
						<Provider store={store}>
							<div
								className={cn(
									'flex min-h-screen overflow-hidden',
									mounted ? 'animate-fade-in' : 'opacity-0'
								)}>
								{/* Sidebar navigation */}
								<Sidebar />

								{/* Main content area */}
								<main className='flex-1 overflow-auto p-6'>
									<div className='animate-slide-in'>{children}</div>
								</main>
							</div>
							<ToastProvider />
						</Provider>
					</ReactQueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
