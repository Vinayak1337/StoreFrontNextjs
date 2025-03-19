import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Settings, SettingsState } from '@/types';
import axios from 'axios';

// Async thunks
export const fetchSettings = createAsyncThunk<
	Settings,
	void,
	{ rejectValue: string }
>('settings/fetchSettings', async (_, { rejectWithValue }) => {
	try {
		const response = await axios.get('/api/settings');
		return response.data;
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to fetch settings';
		return rejectWithValue(errorMessage);
	}
});

export const updateSettings = createAsyncThunk<
	Settings,
	Settings,
	{ rejectValue: string }
>('settings/updateSettings', async (settings, { rejectWithValue }) => {
	try {
		const response = await axios.put('/api/settings', settings);
		return response.data;
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to update settings';
		return rejectWithValue(errorMessage);
	}
});

// Initial state
const initialState: SettingsState = {
	settings: null,
	loading: false,
	error: null
};

// Create the slice
const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		clearError: state => {
			state.error = null;
		}
	},
	extraReducers: builder => {
		// Fetch settings
		builder.addCase(fetchSettings.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(fetchSettings.fulfilled, (state, action) => {
			state.settings = action.payload;
			state.loading = false;
		});
		builder.addCase(fetchSettings.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});

		// Update settings
		builder.addCase(updateSettings.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(updateSettings.fulfilled, (state, action) => {
			state.settings = action.payload;
			state.loading = false;
		});
		builder.addCase(updateSettings.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});
	}
});

export const { clearError } = settingsSlice.actions;
export default settingsSlice.reducer;
