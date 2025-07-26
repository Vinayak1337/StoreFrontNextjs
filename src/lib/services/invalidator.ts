import { revalidateTag, revalidatePath } from 'next/cache';

export function invalidateItemsCache() {
	revalidateTag('uncategorizedItems');
	revalidateTag('categorizedItems');
}

export function invalidateItemsPage() {
	revalidatePath('/items');
}

export function invalidateItems() {
	invalidateItemsCache();
	invalidateItemsPage();
	// Also invalidate dashboard since it shows items data
	invalidateDashboard();
}

export function invalidateDashboardCache() {
	revalidateTag('dashboardItems');
	revalidateTag('dashboardOrders');
	revalidateTag('dashboardMetrics');
	revalidateTag('dashboardDailySales');
}

export function invalidateDashboardPage() {
	revalidatePath('/dashboard');
}

export function invalidateDashboard() {
	invalidateDashboardCache();
	invalidateDashboardPage();
}

export function invalidateOrders() {
	revalidateTag('dashboardOrders');
	revalidateTag('dashboardMetrics');
	revalidateTag('dashboardDailySales');
	revalidatePath('/orders');
	revalidatePath('/dashboard');
}

export function invalidateAnalytics() {
	revalidateTag('dashboardMetrics');
	revalidateTag('dashboardDailySales');
	revalidatePath('/dashboard');
}
