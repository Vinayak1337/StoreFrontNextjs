import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import 'server-only';

export async function GET() {
	try {
		const user = await prisma.user.findFirst({
			select: {
				id: true,
				name: true,
				email: true,
				last_login_at: true
			}
		});

		return NextResponse.json({
			isValid: true,
			user: user ? {
				id: user.id,
				name: user.name,
				email: user.email,
				lastLoginAt: user.last_login_at
			} : null
		});
	} catch (error) {
		console.error('Session verification error:', error);
		return NextResponse.json({ isValid: true, user: null });
	}
}
