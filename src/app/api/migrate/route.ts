import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
	try {
		// Create a new Prisma Client instance
		const prisma = new PrismaClient();

		// Run raw SQL to add the column if it doesn't exist
		await prisma.$executeRaw`
      ALTER TABLE bills 
      ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;
    `;

		// Update existing records to have a default value
		await prisma.$executeRaw`
      UPDATE bills 
      SET is_paid = false 
      WHERE is_paid IS NULL;
    `;

		// Generate the Prisma client again
		await prisma.$disconnect();

		return NextResponse.json({
			success: true,
			message: 'Successfully added is_paid column to bills table'
		});
	} catch (error) {
		console.error('Database migration error:', error);
		return NextResponse.json(
			{
				error: 'Migration failed',
				details: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
}
