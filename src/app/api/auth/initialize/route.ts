import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPasswordAction } from '@/app/actions';
import 'server-only';

// Define types for custom fields
interface CustomUserFields {
	session_id?: string | null;
	session_type?: string | null;
	last_login_at?: Date | null;
}

export async function GET() {
	try {
		// Define the password
		const prodPassword = '570f230e3';
		// No need for devPassword as we're using only prodPassword

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
				} as unknown as CustomUserFields
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
