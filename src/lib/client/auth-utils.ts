'use client';

import { SESSION_TYPES, COOKIE_NAME } from '../auth-constants';

// Re-export constants for backward compatibility
export { SESSION_TYPES, COOKIE_NAME };

/**
 * Login a user with the provided password
 * This function is safe to use in client components
 */
export async function login(password: string) {
	const response = await fetch('/api/auth/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ password, sessionType: SESSION_TYPES.PROD })
	});

	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.error || 'Login failed');
	}

	return response.json();
}

/**
 * Logout the current user
 * This function is safe to use in client components
 */
export async function logout() {
	const response = await fetch('/api/auth/logout', {
		method: 'POST'
	});

	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.error || 'Logout failed');
	}

	return response.json();
}
