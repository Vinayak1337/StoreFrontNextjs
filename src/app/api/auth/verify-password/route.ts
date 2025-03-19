import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import 'server-only';

export async function POST(req: NextRequest) {
	try {
		const { password, hash } = await req.json();

		if (!password || !hash) {
			return NextResponse.json(
				{ error: 'Password and hash are required' },
				{ status: 400 }
			);
		}

		const isValid = await bcrypt.compare(password, hash);

		return NextResponse.json({ isValid });
	} catch (error) {
		console.error('Error verifying password:', error);
		return NextResponse.json(
			{
				error: 'An error occurred while verifying password',
				details: (error as Error).message
			},
			{ status: 500 }
		);
	}
}
