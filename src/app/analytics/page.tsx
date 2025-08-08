import { Suspense } from 'react';
import {
	getAnalyticsMetrics,
	getDailySales,
	getTodayStats
} from '@/app/api/analytics/actions';
import { AnalyticsClient } from '@/components/analytics/analytics-client';

export default async function AnalyticsPage() {
	const endDate = new Date().toISOString().split('T')[0];
	const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		.toISOString()
		.split('T')[0];

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
