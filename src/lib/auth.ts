import { cookies } from 'next/headers';
import prisma from './prisma';
import { COOKIE_NAME } from './auth-constants';
import 'server-only';

export interface SessionData {
	userId: string;
	sessionId: string;
	sessionType: string;
}

/**
 * Verify if the current session is valid by checking the session cookie
 * against the database record.
 */
export async function verifySession(): Promise<SessionData | null> {
	try {
		// Get the cookie
		const cookieStore = await cookies();
		const sessionCookie = cookieStore.get(COOKIE_NAME);
		if (!sessionCookie?.value) {
			return null;
		}

		// Parse session data
		const sessionData = JSON.parse(sessionCookie.value) as SessionData;
		if (!sessionData?.userId || !sessionData?.sessionId) {
			return null;
		}

		// Check if the user exists
		const user = await prisma.user.findUnique({
			where: { id: sessionData.userId }
		});

		if (!user) {
			return null;
		}

		// For now, just return the session data
		// In a production app, you would check if the session is valid
		return sessionData;
	} catch (error) {
		console.error('Session verification error:', error);
		return null;
	}
}

/**
 * Get the current session data without verification (use only in middleware)
 */
export function getSessionData(
	cookieValue: string | undefined
): SessionData | null {
	if (!cookieValue) return null;

	try {
		return JSON.parse(cookieValue) as SessionData;
	} catch {
		return null;
	}
}
