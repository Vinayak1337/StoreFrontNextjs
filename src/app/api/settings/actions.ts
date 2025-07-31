'use server';

import { cache } from 'react';
import prisma from '@/lib/prisma';

export const getSettings = cache(async () => {
	const settings = await prisma.settings.findFirst();
	
	if (!settings) return null;
	
	return {
		...settings,
		taxRate: Number(settings.taxRate)
	};
});