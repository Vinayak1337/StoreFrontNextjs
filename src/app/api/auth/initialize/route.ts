import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPasswordAction } from '@/app/actions';
import 'server-only';

// Define types for custom fields
interface CustomUserFields {
	session_id?: string | null;
	session_type?: string | null;
	last_login_at?: Date | null;
}

// Simple in-memory rate limiting
const MAX_ATTEMPTS = 2;
const RESET_INTERVAL = 60 * 60 * 1000; // 1 hour
const rateLimitStore: Map<string, { count: number; resetAt: number }> =
	new Map();

export async function GET(req: NextRequest) {
	try {
		// Apply rate limiting
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
				{ error: 'Too many initialization attempts. Please try again later.' },
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

		// Get password from environment variable instead of hardcoding
		const prodPassword =
			process.env.INITIAL_ADMIN_PASSWORD || 'temporary-password';

		// Hash the password
		const hashedPassword = await hashPasswordAction(prodPassword);

		// Check if user exists
		const existingUser = await prisma.user.findFirst();

		if (existingUser) {
			// Update existing user
			await prisma.user.update({
				where: { id: existingUser.id },
				data: {
					password: hashedPassword,
					// Clear any existing sessions
					session_id: null
				} as CustomUserFields
			});

			return NextResponse.json({
				success: true,
				message: 'Password updated successfully'
			});
		} else {
			// Create a new user
			await prisma.user.create({
				data: {
					name: 'StoreFront Manager',
					email: 'manager@storefront.com',
					password: hashedPassword
				}
			});

			return NextResponse.json({
				success: true,
				message: 'New user created successfully'
			});
		}
	} catch (error) {
		console.error('Error initializing user:', error);
		return NextResponse.json(
			{
				error: 'Internal server error during initialization'
			},
			{ status: 500 }
		);
	}
}
