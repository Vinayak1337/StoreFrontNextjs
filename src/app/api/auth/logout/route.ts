import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { COOKIE_NAME } from '@/lib/auth-constants';
import 'server-only';

// Define types for custom fields
interface CustomUserFields {
	session_id?: string | null;
	session_type?: string | null;
	last_login_at?: Date | null;
}

export async function POST() {
	try {
		// Get the current session from cookies
		const cookieStore = await cookies();
		const sessionCookie = cookieStore.get(COOKIE_NAME);

		if (sessionCookie?.value) {
			try {
				// Parse the session data
				const { userId } = JSON.parse(sessionCookie.value);

				// Clear the session info in the database
				if (userId) {
					await prisma.user.update({
						where: { id: userId },
						data: {
							session_id: null
						} as unknown as CustomUserFields
					});
				}
			} catch {
				// Ignore JSON parse errors
			}
		}

		// Delete the cookie regardless of whether we found a user
		cookieStore.delete(COOKIE_NAME);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Logout error:', error);
		return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
	}
}
