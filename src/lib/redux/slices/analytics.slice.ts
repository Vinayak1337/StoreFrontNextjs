import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AnalyticsState, DailySalesItem, AnalyticsMetrics } from '@/types';
import api from '@/lib/services/api';

// Async thunks
export const fetchDailySales = createAsyncThunk(
	'analytics/fetchDailySales',
	async (
		{ startDate, endDate }: { startDate: string; endDate: string },
		{ rejectWithValue }
	) => {
		try {
			const response = await api.get(
				`/analytics/daily-sales?startDate=${startDate}&endDate=${endDate}`
			);
			return { dailySales: response.data };
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to fetch daily sales');
		}
	}
);

export const fetchAnalyticsMetrics = createAsyncThunk(
	'analytics/fetchAnalyticsMetrics',
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get('/analytics/metrics');
			return response.data;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to fetch analytics metrics');
		}
	}
);

// Initial state
const initialState: AnalyticsState = {
	salesData: null,
	metrics: null,
	loading: false,
	error: null
};

// Create the slice
const analyticsSlice = createSlice({
	name: 'analytics',
	initialState,
	reducers: {
		clearError: state => {
			state.error = null;
		}
	},
	extraReducers: builder => {
		// Fetch daily sales
		builder.addCase(fetchDailySales.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(
			fetchDailySales.fulfilled,
			(state, action: PayloadAction<{ dailySales: DailySalesItem[] }>) => {
				state.loading = false;
				state.salesData = {
					dailySales: action.payload.dailySales
				};
			}
		);
		builder.addCase(fetchDailySales.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});

		// Fetch analytics metrics
		builder.addCase(fetchAnalyticsMetrics.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(
			fetchAnalyticsMetrics.fulfilled,
			(state, action: PayloadAction<AnalyticsMetrics>) => {
				state.loading = false;
				state.metrics = action.payload;
			}
		);
		builder.addCase(fetchAnalyticsMetrics.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});
	}
});

export const { clearError } = analyticsSlice.actions;

export default analyticsSlice.reducer;
