import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { COOKIE_NAME } from '@/lib/auth-constants';
import { CSRF_TOKEN_COOKIE, CSRF_HEADER } from '@/lib/csrf';
import 'server-only';

// Define types for custom fields
interface CustomUserFields {
	session_id?: string | null;
	session_type?: string | null;
	last_login_at?: Date | null;
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

export async function POST(req: NextRequest) {
	try {
		// CSRF Check
		const cookieHeader = req.headers.get('cookie') || '';
		const cookies = parseCookies(cookieHeader);
		const csrfCookie = cookies[CSRF_TOKEN_COOKIE];
		const csrfHeader = req.headers.get(CSRF_HEADER);

		if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
			return NextResponse.json(
				{ error: 'Invalid CSRF token' },
				{ status: 403 }
			);
		}

		// Get the current session from cookies
		const sessionCookie = cookies[COOKIE_NAME];

		if (sessionCookie) {
			try {
				// Parse the session data
				const { userId } = JSON.parse(decodeURIComponent(sessionCookie));

				// Clear the session info in the database
				if (userId) {
					await prisma.user.update({
						where: { id: userId },
						data: {
							session_id: null
						} as CustomUserFields
					});
				}
			} catch {
				// Ignore JSON parse errors
			}
		}

		// Create response
		const response = NextResponse.json({ success: true });

		// Set cookies to expire immediately (simplified)
		response.headers.set('Set-Cookie', `${COOKIE_NAME}=; Path=/; Max-Age=0`);

		// Set CSRF cookie to expire in a separate header to avoid issues
		response.headers.append(
			'Set-Cookie',
			`${CSRF_TOKEN_COOKIE}=; Path=/; Max-Age=0`
		);

		return response;
	} catch (error) {
		console.error('Logout error:', error);
		return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
	}
}
