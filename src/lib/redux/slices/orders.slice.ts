import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { OrdersState, OrderStatus } from '@/types';
import api from '@/lib/services/api';

// Async thunks
export const fetchOrders = createAsyncThunk(
	'orders/fetchOrders',
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.getAllOrders();
			return response;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to fetch orders');
		}
	}
);

export const createOrder = createAsyncThunk(
	'orders/createOrder',
	async (
		data: {
			customerName: string;
			status: OrderStatus;
			orderItems: Array<{
				itemId: string;
				quantity: number;
				price: number;
			}>;
		},
		{ rejectWithValue }
	) => {
		try {
			const response = await api.createOrder(data);
			return response;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to create order');
		}
	}
);

export const updateOrderStatus = createAsyncThunk(
	'orders/updateOrderStatus',
	async (
		{ id, status }: { id: string; status: OrderStatus },
		{ rejectWithValue }
	) => {
		try {
			const response = await api.updateOrderStatus(id, status);
			return response;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to update order status');
		}
	}
);

// Initial state
const initialState: OrdersState = {
	orders: [],
	activeOrder: null,
	loading: false,
	error: null
};

// Create the slice
const ordersSlice = createSlice({
	name: 'orders',
	initialState,
	reducers: {
		clearError: state => {
			state.error = null;
		}
	},
	extraReducers: builder => {
		// Fetch orders
		builder.addCase(fetchOrders.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(fetchOrders.fulfilled, (state, { payload }) => {
			state.loading = false;
			state.orders = payload;
		});
		builder.addCase(fetchOrders.rejected, (state, { payload }) => {
			state.loading = false;
			state.error = payload as string;
		});

		// Create order
		builder.addCase(createOrder.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(createOrder.fulfilled, (state, { payload }) => {
			state.loading = false;
			state.orders.push(payload);
		});
		builder.addCase(createOrder.rejected, (state, { payload }) => {
			state.loading = false;
			state.error = payload as string;
		});

		// Update order status
		builder.addCase(updateOrderStatus.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(updateOrderStatus.fulfilled, (state, { payload }) => {
			state.loading = false;
			const index = state.orders.findIndex(order => order.id === payload.id);
			if (index !== -1) {
				state.orders[index] = payload;
			}
		});
		builder.addCase(updateOrderStatus.rejected, (state, { payload }) => {
			state.loading = false;
			state.error = payload as string;
		});
	}
});

export const { clearError } = ordersSlice.actions;

export default ordersSlice.reducer;
