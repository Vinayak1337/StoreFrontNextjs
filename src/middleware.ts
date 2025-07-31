import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME } from './lib/auth-constants';

const publicPaths = [
	'/api/auth/login',
	'/api/auth/initialize',
	'/api/auth/csrf',
	'/api/auth/hash-password',
	'/api/auth/verify-password',
	'/login'
];

function parseCookies(cookieHeader: string) {
	const cookies: Record<string, string> = {};

	if (!cookieHeader) return cookies;

	cookieHeader.split(';').forEach(cookie => {
		const [name, value] = cookie.trim().split('=');
		if (name && value) {
			cookies[name] = value;
		}
	});

	return cookies;
}

export function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname;
	if (publicPaths.some(publicPath => path === publicPath)) {
		return NextResponse.next();
	}

	const cookieHeader = request.headers.get('cookie') || '';
	const cookies = parseCookies(cookieHeader);
	const sessionCookie = cookies[COOKIE_NAME];

	if (path === '/') {
		if (sessionCookie) {
			return NextResponse.redirect(new URL('/dashboard', request.url));
		}
		return NextResponse.redirect(new URL('/login', request.url));
	}

	if (!sessionCookie) {
		if (!path.startsWith('/api/')) {
			return NextResponse.redirect(new URL('/login', request.url));
		}
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!_next|static|favicon.ico|robots.txt|images).*)']
};
