'use client';

import { SESSION_TYPES, COOKIE_NAME } from '../auth-constants';
import { fetchWithCsrf } from './csrf-utils';

// Re-export constants for backward compatibility
export { SESSION_TYPES, COOKIE_NAME };

// Local storage key for persistent login
const PERSISTENT_LOGIN_KEY = 'storefront-auth';
const AUTH_EXPIRY_DAYS = 30;

/**
 * User auth data interface
 */
interface AuthData {
	userId: string;
	sessionId: string;
	sessionType: string;
	loginTime: number;
	expiryTime: number;
}

/**
 * Check if auth data is still valid
 */
function isAuthDataValid(authData: AuthData): boolean {
	return Date.now() < authData.expiryTime;
}

/**
 * Store auth data in localStorage
 */
function storeAuthData(authData: Omit<AuthData, 'loginTime' | 'expiryTime'>) {
	if (typeof window === 'undefined') return;

	const loginTime = Date.now();
	const expiryTime = loginTime + (AUTH_EXPIRY_DAYS * 24 * 60 * 60 * 1000); // 30 days

	const fullAuthData: AuthData = {
		...authData,
		loginTime,
		expiryTime
	};

	try {
		localStorage.setItem(PERSISTENT_LOGIN_KEY, JSON.stringify(fullAuthData));
	} catch (error) {
		console.warn('Failed to store auth data in localStorage:', error);
	}
}

/**
 * Get auth data from localStorage
 */
export function getStoredAuthData(): AuthData | null {
	if (typeof window === 'undefined') return null;

	try {
		const stored = localStorage.getItem(PERSISTENT_LOGIN_KEY);
		if (!stored) return null;

		const authData: AuthData = JSON.parse(stored);
		
		// Check if the stored data is still valid
		if (isAuthDataValid(authData)) {
			return authData;
		} else {
			// Remove expired auth data
			removeStoredAuthData();
			return null;
		}
	} catch (error) {
		console.warn('Failed to get auth data from localStorage:', error);
		removeStoredAuthData(); // Clear corrupted data
		return null;
	}
}

/**
 * Remove auth data from localStorage
 */
export function removeStoredAuthData() {
	if (typeof window === 'undefined') return;

	try {
		localStorage.removeItem(PERSISTENT_LOGIN_KEY);
	} catch (error) {
		console.warn('Failed to remove auth data from localStorage:', error);
	}
}

/**
 * Check if user is currently logged in (based on localStorage)
 */
export function isLoggedIn(): boolean {
	return getStoredAuthData() !== null;
}

/**
 * Get current user session info
 */
export function getCurrentSession(): AuthData | null {
	return getStoredAuthData();
}

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

		const data = await response.json();

		// Store session info in localStorage for persistent login
		if (data.success && data.user) {
			storeAuthData({
				userId: data.user.id,
				sessionId: data.user.sessionId || 'unknown',
				sessionType: data.user.sessionType || SESSION_TYPES.PROD
			});
		}

		return data;
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

		// Always remove stored auth data on logout, even if server request fails
		removeStoredAuthData();

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.error || 'Logout failed');
		}

		return response.json();
	} catch (error) {
		console.error('Logout error:', error);
		// Still remove auth data even if there's an error
		removeStoredAuthData();
		throw error;
	}
}

/**
 * Verify current session with server
 */
export async function verifySession(): Promise<boolean> {
	const authData = getStoredAuthData();
	if (!authData) return false;

	try {
		const response = await fetch('/api/auth/verify-session', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			// Session is invalid, remove stored data
			removeStoredAuthData();
			return false;
		}

		return true;
	} catch (error) {
		console.error('Session verification error:', error);
		// On error, assume session is invalid
		removeStoredAuthData();
		return false;
	}
}
