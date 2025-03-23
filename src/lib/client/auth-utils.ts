'use client';

import { SESSION_TYPES, COOKIE_NAME } from '../auth-constants';
import { fetchWithCsrf } from './csrf-utils';

// Re-export constants for backward compatibility
export { SESSION_TYPES, COOKIE_NAME };

/**
 * Get CSRF token from the server
 */
export async function getCsrfToken(): Promise<string> {
	try {
		const response = await fetch('/api/auth/csrf', {
			method: 'GET'
		});

		if (!response.ok) {
			throw new Error('Failed to get CSRF token');
		}

		const data = await response.json();
		return data.csrfToken;
	} catch (error) {
		console.error('Error fetching CSRF token:', error);
		throw new Error('Failed to get CSRF token');
	}
}

/**
 * Login a user with the provided password
 * This function is safe to use in client components
 */
export async function login(password: string) {
	try {
		const response = await fetchWithCsrf('/api/auth/login', {
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
	} catch (error) {
		console.error('Login error:', error);
		throw error;
	}
}

/**
 * Logout the current user
 * This function is safe to use in client components
 */
export async function logout() {
	try {
		const response = await fetchWithCsrf('/api/auth/logout', {
			method: 'POST'
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || 'Logout failed');
		}

		return response.json();
	} catch (error) {
		console.error('Logout error:', error);
		throw error;
	}
}
