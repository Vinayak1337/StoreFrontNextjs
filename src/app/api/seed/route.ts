import { NextResponse } from 'next/server';
import { seed } from '@/lib/seed';

export async function GET() {
	try {
		await seed();
		return NextResponse.json({ message: 'Database seeded successfully' });
	} catch (error: unknown) {
		console.error('Error seeding database:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to seed database';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
