import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export const CSRF_TOKEN_COOKIE = 'csrf_token';
export const CSRF_HEADER = 'x-csrf-token';

// Generate a new CSRF token and return a response with the cookie set
export function generateCsrfToken(): { token: string; cookieHeader: string } {
	// Use uuid instead of crypto.randomUUID() for better compatibility
	const token = uuidv4();

	// Create Set-Cookie header value
	const cookieHeader = `${CSRF_TOKEN_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=3600${
		process.env.NODE_ENV === 'production' ? '; Secure' : ''
	}`;

	return { token, cookieHeader };
}

// Middleware to validate CSRF token
export function validateCsrfToken(req: NextRequest): boolean {
	// Get the CSRF token from cookies
	const cookieHeader = req.headers.get('cookie') || '';
	const cookies = parseCookies(cookieHeader);
	const csrfCookie = cookies[CSRF_TOKEN_COOKIE];

	// Get the CSRF token from header
	const csrfHeader = req.headers.get(CSRF_HEADER);

	if (!csrfCookie || !csrfHeader) {
		return false;
	}

	return csrfCookie === csrfHeader;
}

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

// CSRF protection middleware for API routes
export function csrfProtection(
	handler: (req: NextRequest) => Promise<NextResponse>
) {
	return async (req: NextRequest) => {
		// Skip validation for GET requests as they should not modify state
		if (req.method === 'GET') {
			return handler(req);
		}

		if (!validateCsrfToken(req)) {
			return NextResponse.json(
				{ error: 'Invalid CSRF token' },
				{ status: 403 }
			);
		}

		return handler(req);
	};
}
