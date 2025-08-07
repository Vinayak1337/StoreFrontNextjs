import './globals.css';
import { Inter as FontSans } from 'next/font/google';
import ClientWrapper from './wrapper';

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans'
});

export const metadata = {
	title: 'StoreFront',
	description: 'A modern inventory management system'
};

export default function RootLayout({
	children
}: {
	children: React.ReactNode;
}) {
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
				className={`min-h-screen bg-background text-foreground font-sans antialiased ${fontSans.variable}`}>
				<ClientWrapper>{children}</ClientWrapper>
			</body>
		</html>
	);
}
