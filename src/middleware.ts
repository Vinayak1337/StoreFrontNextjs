import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME } from './lib/auth-constants';
import { CSRF_HEADER, CSRF_TOKEN_COOKIE } from './lib/csrf';

const publicPaths = [
	'/api/auth/login',
	'/api/auth/initialize',
	'/api/auth/csrf',
	'/api/auth/hash-password',
	'/api/auth/verify-password',
	'/login'
];

const protectedPaths = [
	'/dashboard',
	'/items',
	'/orders',
	'/analytics',
	'/settings'
];

// Methods that require CSRF protection
const csrfProtectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

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
	const cookieHeader = request.headers.get('cookie') || '';
	const cookies = parseCookies(cookieHeader);
	const sessionCookie = cookies[COOKIE_NAME];
	
	// Allow public paths
	if (publicPaths.some(publicPath => path === publicPath)) {
		// If already authenticated and trying to access login, redirect to dashboard
		if (path === '/login' && sessionCookie) {
			return NextResponse.redirect(new URL('/dashboard', request.url));
		}
		const response = NextResponse.next();
		response.headers.set('x-pathname', path);
		response.headers.set('x-authenticated', sessionCookie ? 'true' : 'false');
		return response;
	}

	// Handle root path
	if (path === '/') {
		if (sessionCookie) {
			return NextResponse.redirect(new URL('/dashboard', request.url));
		}
		return NextResponse.redirect(new URL('/login', request.url));
	}

	// Check authentication for protected routes
	if (!sessionCookie) {
		// API routes return 401
		if (path.startsWith('/api/')) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		// Protected pages redirect to login
		if (protectedPaths.some(protectedPath => path.startsWith(protectedPath))) {
			const loginUrl = new URL('/login', request.url);
			loginUrl.searchParams.set('from', path);
			return NextResponse.redirect(loginUrl);
		}
	}

	// CSRF Protection for API routes (middleware level)
	if (path.startsWith('/api/') && 
		csrfProtectedMethods.includes(request.method) && 
		!publicPaths.some(publicPath => path === publicPath)) {
		
		const csrfCookie = cookies[CSRF_TOKEN_COOKIE];
		const csrfHeader = request.headers.get(CSRF_HEADER);

		if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
			return NextResponse.json(
				{ error: 'Invalid CSRF token' },
				{ status: 403 }
			);
		}
	}

	// Add auth status and pathname to headers for server components
	const response = NextResponse.next();
	response.headers.set('x-pathname', path);
	if (sessionCookie) {
		response.headers.set('x-authenticated', 'true');
	} else {
		response.headers.set('x-authenticated', 'false');
	}

	return response;
}

export const config = {
	matcher: ['/((?!_next|static|favicon.ico|robots.txt|images).*)']
};
