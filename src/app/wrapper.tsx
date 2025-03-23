'use client';

import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/lib/redux/store';
import { Sidebar } from '@/components/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { ReactQueryProvider } from '@/lib/providers/query-provider';
import { TopNavbar } from '@/components/layout/top-navbar';
import { cn } from '@/lib/utils';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePathname } from 'next/navigation';
import CsrfProvider from '@/components/providers/csrf-provider';

export default function ClientWrapper({
	children
}: {
	children: React.ReactNode;
}) {
	const [mounted, setMounted] = useState(false);
	const pathname = usePathname();

	// Check if the current path is the login page
	const isLoginPage = pathname === '/login';

	// Hydration fix and allows for animation on first load
	useEffect(() => {
		setMounted(true);
	}, []);

	// Detect virtual keyboard for tablets
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const detectKeyboard = () => {
				// Initial window height when page loads
				const initialHeight = window.innerHeight;

				// When window resizes (keyboard appears), check for significant height change
				window.addEventListener('resize', () => {
					const heightDifference = initialHeight - window.innerHeight;

					// If height decreases by more than 20%, keyboard is likely visible
					if (heightDifference > initialHeight * 0.2) {
						document.body.classList.add('keyboard-visible');
					} else {
						document.body.classList.remove('keyboard-visible');
					}
				});
			};

			// Add a media query to adjust layout for tablet portrait mode
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

			// Initial check
			handleTabletPortraitMode(mediaQuery);

			// Add listener for changes
			mediaQuery.addEventListener('change', handleTabletPortraitMode);

			detectKeyboard();

			// Clean up
			return () => {
				mediaQuery.removeEventListener('change', handleTabletPortraitMode);
			};
		}
	}, []);

	return (
		<ThemeProvider attribute='class' defaultTheme='light'>
			<ReactQueryProvider>
				<Provider store={store}>
					<CsrfProvider>
						<div
							className={cn(
								'flex min-h-screen overflow-hidden',
								mounted ? 'animate-fade-in' : 'opacity-0'
							)}>
							{/* Sidebar navigation - only show when not on login page */}
							{!isLoginPage && <Sidebar />}

							{/* Main content area with header and content */}
							<div className='flex-1 flex flex-col overflow-hidden'>
								{/* Top navigation bar - only show when not on login page */}
								{!isLoginPage && <TopNavbar className='z-20' />}

								{/* Main scrollable content */}
								<main className='flex-1 overflow-auto'>
									<div
										className={cn(
											'h-full animate-slide-in',
											!isLoginPage ? 'px-4 py-4 md:px-6 md:py-6' : ''
										)}>
										{children}
									</div>
								</main>
							</div>
						</div>
						<ToastContainer
							position='top-right'
							autoClose={3000}
							hideProgressBar={false}
							newestOnTop
							closeOnClick
							rtl={false}
							pauseOnFocusLoss
							draggable
							pauseOnHover
							theme='light'
							style={{ zIndex: 9999 }}
						/>
					</CsrfProvider>
				</Provider>
			</ReactQueryProvider>
		</ThemeProvider>
	);
}
