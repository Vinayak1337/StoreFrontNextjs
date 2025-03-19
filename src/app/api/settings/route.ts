import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch settings
export async function GET() {
	try {
		// Find the first settings record (there should only be one)
		let settings = await prisma.settings.findFirst();

		// If no settings exist, create default settings
		if (!settings) {
			settings = await prisma.settings.create({
				data: {
					storeName: 'StoreFront',
					address: '123 Main Street, City',
					phone: '(123) 456-7890',
					email: 'contact@storefront.com',
					taxRate: 10,
					currency: 'USD',
					logo: '',
					footer: 'Thank you for your business!',
					notifications: {
						lowStock: true,
						newOrders: true,
						orderStatus: true,
						dailyReports: false
					}
				}
			});
		}

		return NextResponse.json(settings);
	} catch (error) {
		console.error('Error fetching settings:', error);
		return NextResponse.json(
			{ message: 'Failed to fetch settings' },
			{ status: 500 }
		);
	}
}

// PUT - Update settings
export async function PUT(request: Request) {
	try {
		const data = await request.json();

		// Find existing settings
		const existingSettings = await prisma.settings.findFirst();

		let settings;

		if (existingSettings) {
			// Update existing settings
			settings = await prisma.settings.update({
				where: { id: existingSettings.id },
				data
			});
		} else {
			// Create new settings if none exist
			settings = await prisma.settings.create({
				data
			});
		}

		return NextResponse.json(settings);
	} catch (error) {
		console.error('Error updating settings:', error);
		return NextResponse.json(
			{ message: 'Failed to update settings' },
			{ status: 500 }
		);
	}
}
