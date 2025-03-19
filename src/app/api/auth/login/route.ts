import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import { verifyPasswordAction } from '@/app/actions';
import { SESSION_TYPES, COOKIE_NAME } from '@/lib/auth-constants';
import 'server-only';

// Define types for custom fields
interface CustomUserFields {
	session_id?: string | null;
	session_type?: string | null;
	last_login_at?: Date | null;
}

export async function POST(req: NextRequest) {
	try {
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
			} as unknown as CustomUserFields
		});

		// Set the session cookie (never expires)
		const cookieStore = await cookies();
		cookieStore.set({
			name: COOKIE_NAME,
			value: JSON.stringify({
				userId: user.id,
				sessionId,
				sessionType
			}),
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			// Never expires:
			maxAge: 10 * 365 * 24 * 60 * 60, // ~10 years
			path: '/'
		});

		return NextResponse.json({
			success: true,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				sessionType
			}
		});
	} catch (error) {
		console.error('Login error:', error);
		return NextResponse.json({ error: 'Login failed' }, { status: 500 });
	}
}
