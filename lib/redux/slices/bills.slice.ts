import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Bill, BillsState } from '@/types';
import api from '@/services/api';

// Async thunks
export const fetchBills = createAsyncThunk(
	'bills/fetchBills',
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get('/bills');
			return response.data;
		} catch (error: any) {
			return rejectWithValue(error.message || 'Failed to fetch bills');
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
			const response = await api.post('/bills', data);
			return response.data;
		} catch (error: any) {
			return rejectWithValue(error.message || 'Failed to create bill');
		}
	}
);

// Initial state
const initialState: BillsState = {
	bills: [],
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
		fetchBillsSuccess: (state, action: PayloadAction<Bill[]>) => {
			state.bills = action.payload;
			state.loading = false;
		},
		fetchBillsFailure: (state, action: PayloadAction<string>) => {
			state.loading = false;
			state.error = action.payload;
		},

		// Fetch single bill
		fetchBillStart: (state, action: PayloadAction<string>) => {
			state.loading = true;
			state.error = null;
		},
		fetchBillSuccess: (state, action: PayloadAction<Bill>) => {
			state.activeBill = action.payload;
			state.loading = false;
		},
		fetchBillFailure: (state, action: PayloadAction<string>) => {
			state.loading = false;
			state.error = action.payload;
		},

		// Create bill
		createBillStart: (state, action: PayloadAction<Partial<Bill>>) => {
			state.loading = true;
			state.error = null;
		},
		createBillSuccess: (state, action: PayloadAction<Bill>) => {
			state.bills = [action.payload, ...state.bills];
			state.activeBill = action.payload;
			state.loading = false;
		},
		createBillFailure: (state, action: PayloadAction<string>) => {
			state.loading = false;
			state.error = action.payload;
		},

		// Update bill
		updateBillStart: (
			state,
			action: PayloadAction<{ id: string; data: Partial<Bill> }>
		) => {
			state.loading = true;
			state.error = null;
		},
		updateBillSuccess: (state, action: PayloadAction<Bill>) => {
			state.bills = state.bills.map(bill =>
				bill.id === action.payload.id ? action.payload : bill
			);
			if (state.activeBill?.id === action.payload.id) {
				state.activeBill = action.payload;
			}
			state.loading = false;
		},
		updateBillFailure: (state, action: PayloadAction<string>) => {
			state.loading = false;
			state.error = action.payload;
		},

		// Delete bill
		deleteBillStart: (state, action: PayloadAction<string>) => {
			state.loading = true;
			state.error = null;
		},
		deleteBillSuccess: (state, action: PayloadAction<string>) => {
			state.bills = state.bills.filter(bill => bill.id !== action.payload);
			if (state.activeBill?.id === action.payload) {
				state.activeBill = null;
			}
			state.loading = false;
		},
		deleteBillFailure: (state, action: PayloadAction<string>) => {
			state.loading = false;
			state.error = action.payload;
		},

		// Set active bill
		setActiveBill: (state, action: PayloadAction<Bill | null>) => {
			state.activeBill = action.payload;
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
		builder.addCase(
			fetchBills.fulfilled,
			(state, action: PayloadAction<Bill[]>) => {
				state.loading = false;
				state.bills = action.payload;
			}
		);
		builder.addCase(fetchBills.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});

		// Create bill
		builder.addCase(createBill.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(
			createBill.fulfilled,
			(state, action: PayloadAction<Bill>) => {
				state.loading = false;
				state.bills.push(action.payload);
			}
		);
		builder.addCase(createBill.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
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
