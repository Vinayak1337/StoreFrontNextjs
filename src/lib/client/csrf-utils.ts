'use client';

import { CSRF_HEADER } from '../csrf';

// Track the CSRF token and expiration
let csrfToken: string | null = null;
let tokenExpiry: number = 0;
const TOKEN_LIFETIME = 50 * 60 * 1000; // 50 minutes (tokens last 1 hour on server)

/**
 * Fetch a fresh CSRF token from the server
 */
async function fetchCsrfToken(): Promise<string> {
	try {
		// Clear any cached token
		csrfToken = null;

		const response = await fetch('/api/auth/csrf', {
			method: 'GET',
			cache: 'no-store',
			headers: {
				'Cache-Control': 'no-cache',
				Pragma: 'no-cache'
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch CSRF token');
		}

		const data = await response.json();

		if (!data.csrfToken) {
			throw new Error('Invalid CSRF token response');
		}

		// Update the token and expiry
		csrfToken = data.csrfToken;
		tokenExpiry = Date.now() + TOKEN_LIFETIME;

		return csrfToken;
	} catch (error) {
		console.error('CSRF token fetch error:', error);
		throw new Error(
			'Could not get CSRF protection. Please refresh the page and try again.'
		);
	}
}

/**
 * Get a valid CSRF token, refreshing if necessary
 */
export async function getCsrfToken(): Promise<string> {
	// If we have a valid token, return it
	if (csrfToken && Date.now() < tokenExpiry) {
		return csrfToken;
	}

	// Otherwise fetch a new one
	return fetchCsrfToken();
}

/**
 * Add CSRF token to fetch headers
 */
export async function addCsrfHeader(
	headers: HeadersInit = {}
): Promise<Headers> {
	const token = await getCsrfToken();
	const newHeaders = new Headers(headers);
	newHeaders.set(CSRF_HEADER, token);
	return newHeaders;
}

/**
 * Wrapper for fetch that adds CSRF protection
 */
export async function fetchWithCsrf(
	url: string,
	options: RequestInit = {}
): Promise<Response> {
	// Only add CSRF for methods that modify data
	if (!options.method || options.method === 'GET') {
		return fetch(url, options);
	}

	try {
		const headers = await addCsrfHeader(options.headers);

		const response = await fetch(url, {
			...options,
			headers
		});

		// If we get a CSRF error, try once more with a fresh token
		if (response.status === 403) {
			const errorData = await response.json();
			if (errorData.error === 'Invalid CSRF token') {
				console.warn('CSRF token expired, refreshing and retrying request');
				await fetchCsrfToken(); // Force token refresh
				const newHeaders = await addCsrfHeader(options.headers);

				return fetch(url, {
					...options,
					headers: newHeaders
				});
			}

			// If it's a different 403 error, just return it
			return new Response(JSON.stringify(errorData), { status: 403 });
		}

		return response;
	} catch (error) {
		console.error('Error in fetchWithCsrf:', error);
		throw error;
	}
}
