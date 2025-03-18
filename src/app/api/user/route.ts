import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
	try {
		// In a real app, this would get the user from the session
		// Here we'll just get the first (and only) user, which is the store manager
		const user = await prisma.user.findFirst();

		if (!user) {
			return NextResponse.json(
				{ error: 'Store manager not found' },
				{ status: 404 }
			);
		}

		// Don't return the password
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...userWithoutPassword } = user;

		return NextResponse.json(userWithoutPassword);
	} catch (error: unknown) {
		console.error('Error fetching user:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to fetch user';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
