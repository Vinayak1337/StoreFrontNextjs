import { NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';

// GET /api/auth/csrf - Generate a new CSRF token
export async function GET() {
	try {
		// Generate CSRF token and get cookie header
		const { token, cookieHeader } = generateCsrfToken();

		// Create response with token
		const response = NextResponse.json({ csrfToken: token });

		// Set the Set-Cookie header
		response.headers.set('Set-Cookie', cookieHeader);

		return response;
	} catch (error) {
		console.error('CSRF token generation error:', error);
		return NextResponse.json(
			{ error: 'Failed to generate CSRF token' },
			{ status: 500 }
		);
	}
}
