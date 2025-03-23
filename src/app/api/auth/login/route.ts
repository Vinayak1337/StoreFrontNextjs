import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import { verifyPasswordAction } from '@/app/actions';
import { SESSION_TYPES, COOKIE_NAME } from '@/lib/auth-constants';
import { CSRF_HEADER, CSRF_TOKEN_COOKIE } from '@/lib/csrf';
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

// Simple in-memory rate limiting
const MAX_ATTEMPTS = 5;
const RESET_INTERVAL = 60 * 1000; // 1 minute
const rateLimitStore: Map<string, { count: number; resetAt: number }> =
	new Map();

export async function POST(req: NextRequest) {
	try {
		// 1. CSRF Check
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

		// 2. Rate limiting
		const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
		const now = Date.now();

		let limitData = rateLimitStore.get(clientIp);
		if (!limitData || limitData.resetAt < now) {
			limitData = {
				count: 0,
				resetAt: now + RESET_INTERVAL
			};
		}

		limitData.count++;
		rateLimitStore.set(clientIp, limitData);

		if (limitData.count > MAX_ATTEMPTS) {
			return NextResponse.json(
				{ error: 'Too many login attempts. Please try again later.' },
				{
					status: 429,
					headers: {
						'Retry-After': Math.ceil(
							(limitData.resetAt - now) / 1000
						).toString()
					}
				}
			);
		}

		// 3. Login logic
		const { password, sessionType = SESSION_TYPES.PROD } = await req.json();

		if (!password) {
			return NextResponse.json(
				{ error: 'Password is required' },
				{ status: 400 }
			);
		}

		// Find the user in the database
		const user = await prisma.user.findFirst();

		if (!user) {
			return NextResponse.json(
				{ error: 'User not found. Please initialize the system.' },
				{ status: 404 }
			);
		}

		// Verify the password against the hash stored in the database
		const passwordMatch = await verifyPasswordAction(password, user.password);
		if (!passwordMatch) {
			return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
		}

		// Generate a new session ID
		const sessionId = uuidv4();

		// Update user with new session information using type for custom fields
		await prisma.user.update({
			where: { id: user.id },
			data: {
				session_id: sessionId,
				session_type: sessionType,
				last_login_at: new Date()
			} as CustomUserFields
		});

		// Create response with user data
		const response = NextResponse.json({
			success: true,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				sessionType
			}
		});

		// Set the session cookie with 30 day expiration
		const sessionValue = JSON.stringify({
			userId: user.id,
			sessionId,
			sessionType
		});

		// Create cookie
		response.headers.set(
			'Set-Cookie',
			`${COOKIE_NAME}=${encodeURIComponent(
				sessionValue
			)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000`
		);

		return response;
	} catch (error) {
		console.error('Login error:', error);
		return NextResponse.json({ error: 'Login failed' }, { status: 500 });
	}
}
