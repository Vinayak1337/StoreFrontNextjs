import { Suspense } from 'react';
import {
	getAnalyticsMetrics,
	getDailySales,
	getTodayStats
} from '@/app/api/analytics/actions';
import { AnalyticsClient } from '@/components/analytics/analytics-client';
import { getOrderReportingWindow } from '@/lib/server/reporting-window';

export default async function AnalyticsPage() {
	const { startDateKey, endDateKey, periodLabel } =
		await getOrderReportingWindow(30);

	const [metrics, salesData, todayStats] = await Promise.all([
		getAnalyticsMetrics(startDateKey, endDateKey),
		getDailySales(startDateKey, endDateKey),
		getTodayStats(endDateKey)
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
					reportingEndDate={endDateKey}
					reportingPeriodLabel={periodLabel}
				/>
			</Suspense>
		</div>
	);
}
