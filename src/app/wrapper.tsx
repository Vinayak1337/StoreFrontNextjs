'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { ToastProvider } from '@/components/toast-provider';
import { usePathname } from 'next/navigation';
import CsrfProvider from '@/components/providers/csrf-provider';
import { useAuth } from '@/hooks/use-auth';
import { autoConnectToSavedPrinter } from '@/lib/utils/printer-utils';

export default function ClientWrapper({
	children
}: {
	children: React.ReactNode;
}) {
	const [mounted, setMounted] = useState(false);
	const pathname = usePathname();
	const { isAuthenticated, isLoading } = useAuth();

	// Check if the current path is the login page
	const isLoginPage = pathname === '/login';

	// Hydration fix and allows for animation on first load
	useEffect(() => {
		setMounted(true);
	}, []);

	// Auto-connect to saved thermal printer when user is authenticated
	useEffect(() => {
		if (isAuthenticated && !isLoginPage && mounted) {
			autoConnectToSavedPrinter().catch(error => {
				console.log('Auto-connect to printer failed:', error);
			});
		}
	}, [isAuthenticated, isLoginPage, mounted]);

	// Detect virtual keyboard for tablets
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const detectKeyboard = () => {
				const initialHeight = window.innerHeight;
				window.addEventListener('resize', () => {
					const heightDifference = initialHeight - window.innerHeight;
					if (heightDifference > initialHeight * 0.2) {
						document.body.classList.add('keyboard-visible');
					} else {
						document.body.classList.remove('keyboard-visible');
					}
				});
			};

			const mediaQuery = window.matchMedia(
				'(min-width: 600px) and (max-width: 1023px) and (orientation: portrait)'
			);

			const handleTabletPortraitMode = (
				e: MediaQueryListEvent | MediaQueryList
			) => {
				if (e.matches) {
					document.body.classList.add('tablet-portrait');
				} else {
					document.body.classList.remove('tablet-portrait');
				}
			};

			handleTabletPortraitMode(mediaQuery);
			mediaQuery.addEventListener('change', handleTabletPortraitMode);
			detectKeyboard();
			return () => {
				mediaQuery.removeEventListener('change', handleTabletPortraitMode);
			};
		}
	}, []);

	if (!mounted || isLoading) {
		return (
			<ThemeProvider attribute='class' defaultTheme='system' enableSystem>
				<div className='flex min-h-screen items-center justify-center bg-background'>
					<div className='flex flex-col items-center space-y-4'>
						<div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
						<p className='text-muted-foreground'>Loading...</p>
					</div>
				</div>
			</ThemeProvider>
		);
	}

	return (
		<ThemeProvider attribute='class' defaultTheme='system' enableSystem>
			<CsrfProvider>
						<div
							className={cn(
								'flex min-h-screen overflow-hidden',
								mounted ? 'animate-fade-in' : 'opacity-0'
							)}>
							{isAuthenticated && !isLoginPage && <Sidebar />}
							<div className='flex-1 flex flex-col overflow-hidden'>
								<main className='flex-1 overflow-auto bg-background'>
									<div
										className={cn(
											'h-full animate-slide-in',
											isAuthenticated && !isLoginPage 
												? 'p-4 md:p-6 md:pb-20 lg:pb-6 lg:pl-[calc(16rem+2rem)] xl:pl-[calc(18rem+2rem)] lg:pr-8' 
												: ''
										)}>
										{children}
									</div>
								</main>
							</div>
						</div>
						<ToastProvider />
			</CsrfProvider>
		</ThemeProvider>
	);
}
