import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BillsState } from '@/types';
import api from '@/lib/services/api';
import { Bill } from '@/types';

// Async thunks
export const fetchBills = createAsyncThunk(
	'bills/fetchBills',
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.getAllBills();
			return response;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to fetch bills');
		}
	}
);

export const createBill = createAsyncThunk(
	'bills/createBill',
	async (
		data: {
			orderId: string;
			totalAmount: number;
			taxes: number;
			paymentMethod: string;
		},
		{ rejectWithValue }
	) => {
		try {
			const response = await api.createBill(data);
			return response;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to create bill');
		}
	}
);

// Initial state
const initialState: BillsState = {
	bills: [],
	activeBill: null,
	loading: false,
	error: null
};

// Create the slice
const billsSlice = createSlice({
	name: 'bills',
	initialState,
	reducers: {
		// Fetch bills
		fetchBillsStart: state => {
			state.loading = true;
			state.error = null;
		},
		fetchBillsSuccess: (state, { payload }) => {
			state.bills = payload;
			state.loading = false;
		},
		fetchBillsFailure: (state, { payload }) => {
			state.loading = false;
			state.error = payload;
		},

		// Fetch single bill
		fetchBillStart: state => {
			state.loading = true;
			state.error = null;
		},
		fetchBillSuccess: (state, { payload }) => {
			state.activeBill = payload;
			state.loading = false;
		},
		fetchBillFailure: (state, { payload }) => {
			state.loading = false;
			state.error = payload;
		},

		// Create bill
		createBillStart: state => {
			state.loading = true;
			state.error = null;
		},
		createBillSuccess: (state, { payload }) => {
			state.bills = [payload, ...state.bills];
			state.activeBill = payload;
			state.loading = false;
		},
		createBillFailure: (state, { payload }) => {
			state.loading = false;
			state.error = payload;
		},

		// Update bill
		updateBillStart: state => {
			state.loading = true;
			state.error = null;
		},
		updateBillSuccess: (state, { payload }) => {
			state.bills = state.bills.map((bill: Bill) =>
				bill.id === payload.id ? payload : bill
			);
			if (state.activeBill?.id === payload.id) {
				state.activeBill = payload;
			}
			state.loading = false;
		},
		updateBillFailure: (state, { payload }) => {
			state.loading = false;
			state.error = payload;
		},

		// Delete bill
		deleteBillStart: state => {
			state.loading = true;
			state.error = null;
		},
		deleteBillSuccess: (state, { payload }) => {
			state.bills = state.bills.filter(bill => bill.id !== payload);
			if (state.activeBill?.id === payload) {
				state.activeBill = null;
			}
			state.loading = false;
		},
		deleteBillFailure: (state, { payload }) => {
			state.loading = false;
			state.error = payload;
		},

		// Set active bill
		setActiveBill: (state, { payload }) => {
			state.activeBill = payload;
		},

		// Clear error
		clearError: state => {
			state.error = null;
		}
	},
	extraReducers: builder => {
		// Fetch bills
		builder.addCase(fetchBills.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(fetchBills.fulfilled, (state, { payload }) => {
			state.loading = false;
			state.bills = payload;
		});
		builder.addCase(fetchBills.rejected, (state, { payload }) => {
			state.loading = false;
			state.error = payload as string;
		});

		// Create bill
		builder.addCase(createBill.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(createBill.fulfilled, (state, { payload }) => {
			state.loading = false;
			state.bills.push(payload);
		});
		builder.addCase(createBill.rejected, (state, { payload }) => {
			state.loading = false;
			state.error = payload as string;
		});
	}
});

export const {
	fetchBillsStart,
	fetchBillsSuccess,
	fetchBillsFailure,
	fetchBillStart,
	fetchBillSuccess,
	fetchBillFailure,
	createBillStart,
	createBillSuccess,
	createBillFailure,
	updateBillStart,
	updateBillSuccess,
	updateBillFailure,
	deleteBillStart,
	deleteBillSuccess,
	deleteBillFailure,
	setActiveBill,
	clearError
} = billsSlice.actions;

export default billsSlice.reducer;
