import { Suspense } from 'react';
import {
	getAnalyticsMetrics,
	getDailySales,
	getTodayStats
} from '@/app/api/analytics/actions';
import { AnalyticsClient } from '@/components/analytics/analytics-client';

export default async function AnalyticsPage() {
	// Get current date in local timezone
	const now = new Date();
	const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
	
	// Get date 30 days ago
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
	const startDate = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`;

	const [metrics, salesData, todayStats] = await Promise.all([
		getAnalyticsMetrics(startDate, endDate),
		getDailySales(startDate, endDate),
		getTodayStats()
	]);

	return (
		<div className='container py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6'>
			<Suspense
				fallback={
					<div className='flex items-center justify-center min-h-[400px] p-8'>
						<div className='text-center text-muted-foreground'>
							Loading analytics...
						</div>
					</div>
				}>
				<AnalyticsClient
					initialMetrics={metrics}
					initialSalesData={salesData}
					todayStats={todayStats}
				/>
			</Suspense>
		</div>
	);
}
