import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { COOKIE_NAME } from '@/lib/auth-constants';
import 'server-only';

// Helper function to parse cookies from header
function parseCookies(cookieHeader: string) {
	const cookies: Record<string, string> = {};

	if (!cookieHeader) return cookies;

	cookieHeader.split(';').forEach(cookie => {
		const [name, value] = cookie.trim().split('=');
		if (name && value) {
			cookies[name] = decodeURIComponent(value);
		}
	});

	return cookies;
}

export async function GET(req: NextRequest) {
	try {
		// Get session data from cookie
		const cookieHeader = req.headers.get('cookie') || '';
		const cookies = parseCookies(cookieHeader);
		const sessionCookie = cookies[COOKIE_NAME];

		if (!sessionCookie) {
			return NextResponse.json(
				{ error: 'No session found', isValid: false },
				{ status: 401 }
			);
		}

		// Parse session data
		let sessionData;
		try {
			sessionData = JSON.parse(sessionCookie);
		} catch {
			return NextResponse.json(
				{ error: 'Invalid session format', isValid: false },
				{ status: 401 }
			);
		}

		const { userId, sessionId } = sessionData;

		if (!userId || !sessionId) {
			return NextResponse.json(
				{ error: 'Incomplete session data', isValid: false },
				{ status: 401 }
			);
		}

		// Verify session in database
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				name: true,
				email: true,
				session_id: true,
				last_login_at: true
			}
		});

		if (!user || user.session_id !== sessionId) {
			return NextResponse.json(
				{ error: 'Invalid session', isValid: false },
				{ status: 401 }
			);
		}

		// Session is valid
		return NextResponse.json({
			isValid: true,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				lastLoginAt: user.last_login_at
			}
		});
	} catch (error) {
		console.error('Session verification error:', error);
		return NextResponse.json(
			{ error: 'Session verification failed', isValid: false },
			{ status: 500 }
		);
	}
}