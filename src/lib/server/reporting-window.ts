import { cache } from 'react';
import prisma from '@/lib/prisma';

export function startOfDay(date: Date) {
	const next = new Date(date);
	next.setHours(0, 0, 0, 0);
	return next;
}

export function endOfDay(date: Date) {
	const next = new Date(date);
	next.setHours(23, 59, 59, 999);
	return next;
}

export function addDays(date: Date, days: number) {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
}

export function formatDateKey(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
		2,
		'0'
	)}-${String(date.getDate()).padStart(2, '0')}`;
}

export function parseDateKey(dateKey: string) {
	const [year, month, day] = dateKey.split('-').map(Number);
	return new Date(year, month - 1, day);
}

export function formatPeriodLabel(startDate: Date, endDate: Date) {
	const formatter = new Intl.DateTimeFormat('en-IN', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});

	return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

export const getLatestOrderDate = cache(async () => {
	const latestOrder = await prisma.order.findFirst({
		select: { createdAt: true },
		orderBy: { createdAt: 'desc' }
	});

	return latestOrder?.createdAt ?? new Date();
});

export const getOrderReportingWindow = cache(async (days = 30) => {
	const latestOrderDate = await getLatestOrderDate();
	const endDate = endOfDay(latestOrderDate);
	const startDate = startOfDay(addDays(endDate, -(days - 1)));

	return {
		startDate,
		endDate,
		startDateKey: formatDateKey(startDate),
		endDateKey: formatDateKey(endDate),
		periodLabel: formatPeriodLabel(startDate, endDate)
	};
});
