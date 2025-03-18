import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/services/api';
import {
	fetchDailySalesStart,
	fetchDailySalesSuccess,
	fetchDailySalesFailure,
	fetchAnalyticsMetricsStart,
	fetchAnalyticsMetricsSuccess,
	fetchAnalyticsMetricsFailure
} from '../slices/analytics.slice';

// Worker saga for fetching daily sales
function* fetchDailySalesSaga(
	action: PayloadAction<{ startDate: string; endDate: string }>
) {
	try {
		const { startDate, endDate } = action.payload;
		const response = yield call(
			api.get,
			`/analytics/daily-sales?startDate=${startDate}&endDate=${endDate}`
		);
		yield put(fetchDailySalesSuccess({ dailySales: response.data }));
	} catch (error) {
		yield put(
			fetchDailySalesFailure(error.message || 'Failed to fetch daily sales')
		);
	}
}

// Worker saga for fetching analytics metrics
function* fetchAnalyticsMetricsSaga() {
	try {
		const response = yield call(api.get, '/analytics/metrics');
		yield put(fetchAnalyticsMetricsSuccess(response.data));
	} catch (error) {
		yield put(
			fetchAnalyticsMetricsFailure(
				error.message || 'Failed to fetch analytics metrics'
			)
		);
	}
}

// Watcher saga
export function* analyticsSaga() {
	yield takeLatest(fetchDailySalesStart.type, fetchDailySalesSaga);
	yield takeLatest(fetchAnalyticsMetricsStart.type, fetchAnalyticsMetricsSaga);
}
