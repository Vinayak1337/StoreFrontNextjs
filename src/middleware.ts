import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME } from './lib/auth-constants';

// Paths that don't require authentication
const publicPaths = [
	'/api/auth/login',
	'/api/auth/initialize',
	'/api/auth/csrf',
	'/api/auth/hash-password',
	'/api/auth/verify-password',
	'/login'
];

// Helper function to parse cookies from header
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
	// Check if the path is public and if so, skip authentication
	const path = request.nextUrl.pathname;
	
	// Create response with optimizations for API routes
	let response: NextResponse;
	
	if (publicPaths.some(publicPath => path === publicPath)) {
		response = NextResponse.next();
	} else {
		// Get the session cookie
		const cookieHeader = request.headers.get('cookie') || '';
		const cookies = parseCookies(cookieHeader);
		const sessionCookie = cookies[COOKIE_NAME];

		// For homepage - redirect to dashboard if authenticated, redirect to login if not
		if (path === '/') {
			if (sessionCookie) {
				response = NextResponse.redirect(new URL('/dashboard', request.url));
			} else {
				response = NextResponse.redirect(new URL('/login', request.url));
			}
		} else if (!sessionCookie) {
			// Redirect to login for non-API routes
			if (!path.startsWith('/api/')) {
				response = NextResponse.redirect(new URL('/login', request.url));
			} else {
				// Return 401 for API routes
				response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
			}
		} else {
			// User is authenticated, let them proceed
			response = NextResponse.next();
		}
	}

	// Add timeout and connection optimization headers for API routes
	if (path.startsWith('/api/')) {
		response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
		response.headers.set('Connection', 'close');
		response.headers.set('Keep-Alive', 'timeout=5, max=1000');
		
		// Add CORS headers
		response.headers.set('Access-Control-Allow-Origin', '*');
		response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	}
	
	return response;
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
