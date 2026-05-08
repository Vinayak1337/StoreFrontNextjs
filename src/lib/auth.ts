import 'server-only';

export interface SessionData {
	userId: string;
	sessionId: string;
	sessionType: string;
}

/**
 * Public mode keeps the legacy auth surface available without gating pages.
 */
export async function verifySession(): Promise<SessionData | null> {
	return {
		userId: 'public',
		sessionId: 'public',
		sessionType: 'public'
	};
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
