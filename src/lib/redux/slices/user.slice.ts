import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from '@/lib/services/api';

// Define the User interface
interface User {
	id: string;
	name: string;
	email: string;
}

// Define the User state
interface UserState {
	user: User | null;
	loading: boolean;
	error: string | null;
}

// Initial state
const initialState: UserState = {
	user: null,
	loading: false,
	error: null
};

// Create async thunk for fetching current user
export const fetchCurrentUser = createAsyncThunk(
	'user/fetchCurrentUser',
	async (_, { rejectWithValue }) => {
		try {
			const user = await userAPI.getCurrentUser();
			return user;
		} catch (error: unknown) {
			return rejectWithValue(
				error instanceof Error ? error.message : 'Failed to fetch user'
			);
		}
	}
);

// Create the user slice
const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder
			.addCase(fetchCurrentUser.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCurrentUser.fulfilled, (state, action) => {
				state.user = action.payload;
				state.loading = false;
			})
			.addCase(fetchCurrentUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	}
});

export default userSlice.reducer;
