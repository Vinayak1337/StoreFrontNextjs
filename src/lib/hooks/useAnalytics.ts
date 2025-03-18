import { useQuery } from '@tanstack/react-query';
import api from '@/lib/services/api';

// Hook for fetching daily sales data
export function useDailySales(startDate: string, endDate: string) {
	return useQuery({
		queryKey: ['dailySales', startDate, endDate],
		queryFn: async () => {
			const response = await api.getDailySales(startDate, endDate);
			return response.map(item => ({
				date: item.date,
				totalAmount: item.sales,
				count: item.orderCount
			}));
		},
		enabled: !!startDate && !!endDate
	});
}

// Hook for fetching analytics metrics
export function useAnalyticsMetrics() {
	return useQuery({
		queryKey: ['analyticsMetrics'],
		queryFn: () => api.getMetrics()
	});
}
