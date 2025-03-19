import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import 'server-only';

export async function POST(req: NextRequest) {
	try {
		const { password } = await req.json();

		if (!password) {
			return NextResponse.json(
				{ error: 'Password is required' },
				{ status: 400 }
			);
		}

		const saltRounds = process.env.BCRYPT_SALT_ROUNDS
			? parseInt(process.env.BCRYPT_SALT_ROUNDS)
			: 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		return NextResponse.json({ hash: hashedPassword });
	} catch (error) {
		console.error('Error hashing password:', error);
		return NextResponse.json(
			{
				error: 'An error occurred while hashing password',
				details: (error as Error).message
			},
			{ status: 500 }
		);
	}
}
