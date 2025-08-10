import './globals.css';
import { Inter as FontSans } from 'next/font/google';
import { headers } from 'next/headers';
import { Sidebar } from '@/components/sidebar';
import ClientEffects from './client-effects';
import { cn } from '@/lib/utils';

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans'
});

export const metadata = {
	title: 'StoreFront',
	description: 'A modern inventory management system'
};

export default async function RootLayout({
	children
}: {
	children: React.ReactNode;
}) {
	const headersList = await headers();
	const pathname = headersList.get('x-pathname') || '/';

	const isLoginPage = pathname === '/login';
	// Show layout chrome (like sidebar) for all non-login, non-root routes.
	// Middleware already guards protected routes, so we don't gate on auth here
	// to avoid hydration flicker after client-side login redirects.
	const isProtectedRoute = !isLoginPage && pathname !== '/';

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
				className={`min-h-screen bg-white text-gray-900 font-sans antialiased ${fontSans.variable}`}>
				<div
					className={cn(
						'flex min-h-screen overflow-hidden',
						'animate-fade-in'
					)}>
					{isProtectedRoute && <Sidebar />}
					<div className='flex-1 flex flex-col overflow-hidden'>
						<main className='flex-1 overflow-auto bg-gray-50/30'>
							<div
								className={cn(
									'h-full animate-slide-in',
									isProtectedRoute
										? 'pt-16 md:pt-4 px-4 pb-4 md:p-6 md:pb-20 lg:pb-6 lg:pl-[calc(16rem+2rem)] xl:pl-[calc(18rem+2rem)] lg:pr-8'
										: ''
								)}>
								{children}
							</div>
						</main>
					</div>
				</div>
				{/* Client-only effects (toasts, keyboard/tablet detection) */}
				<ClientEffects />
			</body>
		</html>
	);
}
