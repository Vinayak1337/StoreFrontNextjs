'use server';

import { cache } from 'react';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';

interface UpdateSettingsData {
	storeName?: string;
	address?: string;
	phone?: string;
	email?: string;
	taxRate?: number;
	currency?: string;
	footer?: string;
	notifications?: {
		outOfStock?: boolean;
		newOrders?: boolean;
		orderStatus?: boolean;
		dailyReports?: boolean;
	};
	printer?: {
		name?: string;
		deviceId?: string;
		type?: string;
		autoConnect?: boolean;
		connected?: boolean;
		paperWidth?: number;
	};
}

export const getSettings = cache(async () => {
	const settings = await prisma.settings.findFirst();
	
	if (!settings) {
		const defaultSettings = await prisma.settings.create({
			data: {
				storeName: 'StoreFront',
				address: '123 Main Street, City',
				phone: '(123) 456-7890',
				email: 'contact@storefront.com',
				taxRate: 10,
				currency: 'INR',
				footer: 'Thank you for your business!',
				notifications: {
					outOfStock: true,
					newOrders: true,
					orderStatus: true,
					dailyReports: false
				},
				printer: {
					name: '',
					deviceId: '',
					type: 'bluetooth',
					autoConnect: false,
					connected: false,
					paperWidth: 80
				}
			}
		});
		
		return {
			...defaultSettings,
			taxRate: Number(defaultSettings.taxRate)
		} as Settings;
	}
	
	return {
		...settings,
		taxRate: Number(settings.taxRate)
	} as Settings;
});

export async function updateSettings(data: UpdateSettingsData) {
	try {
		const existingSettings = await prisma.settings.findFirst();
		
		let updatedSettings;
		if (existingSettings) {
			updatedSettings = await prisma.settings.update({
				where: { id: existingSettings.id },
				data: {
					storeName: data.storeName,
					address: data.address,
					phone: data.phone,
					email: data.email,
					taxRate: data.taxRate,
					currency: data.currency,
					footer: data.footer,
					notifications: data.notifications,
					printer: data.printer
				}
			});
		} else {
			updatedSettings = await prisma.settings.create({
				data: {
					storeName: data.storeName || 'StoreFront',
					address: data.address || '',
					phone: data.phone || '',
					email: data.email || '',
					taxRate: data.taxRate || 0,
					currency: data.currency || 'INR',
					footer: data.footer || '',
					notifications: data.notifications || {},
					printer: data.printer || {}
				}
			});
		}

		revalidatePath('/settings');
		
		return {
			success: true,
			settings: {
				...updatedSettings,
				taxRate: Number(updatedSettings.taxRate)
			}
		};
	} catch (error) {
		console.error('Error updating settings:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update settings'
		};
	}
}