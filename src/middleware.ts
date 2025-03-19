import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME } from './lib/auth-constants';

// Paths that don't require authentication
const publicPaths = [
	'/api/auth/login',
	'/api/auth/initialize',
	'/api/auth/hash-password',
	'/api/auth/verify-password',
	'/login'
];

export function middleware(request: NextRequest) {
	// Check if the path is public and if so, skip authentication
	const path = request.nextUrl.pathname;
	if (publicPaths.some(publicPath => path === publicPath)) {
		return NextResponse.next();
	}

	// Get the session cookie
	const sessionCookie = request.cookies.get(COOKIE_NAME);

	// For homepage - redirect to dashboard if authenticated, redirect to login if not
	if (path === '/') {
		if (sessionCookie) {
			return NextResponse.redirect(new URL('/dashboard', request.url));
		}
		return NextResponse.redirect(new URL('/login', request.url));
	}

	// For all other paths - check for authentication
	if (!sessionCookie) {
		// Redirect to login for non-API routes
		if (!path.startsWith('/api/')) {
			return NextResponse.redirect(new URL('/login', request.url));
		}
		// Return 401 for API routes
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	// User is authenticated, let them proceed
	return NextResponse.next();
}

// Only apply middleware to these paths
export const config = {
	matcher: [
		/*
		 * Match all paths except:
		 * 1. /_next (Next.js internals)
		 * 2. /static (static files)
		 * 3. /favicon.ico, /robots.txt (common files)
		 * 4. /images (static images)
		 */
		'/((?!_next|static|favicon.ico|robots.txt|images).*)'
	]
};
