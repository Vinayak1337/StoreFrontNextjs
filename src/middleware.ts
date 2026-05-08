import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname;

	if (path === '/' || path === '/login') {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	const response = NextResponse.next();
	response.headers.set('x-pathname', path);
	response.headers.set('x-authenticated', 'true');

	return response;
}

export const config = {
	matcher: ['/((?!_next|static|favicon.ico|robots.txt|images).*)']
};
