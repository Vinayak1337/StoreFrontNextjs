import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Order, OrdersState, OrderStatus } from '@/types';
import api from '@/services/api';

// Async thunks
export const fetchOrders = createAsyncThunk(
	'orders/fetchOrders',
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get('/orders');
			return response.data;
		} catch (error: any) {
			return rejectWithValue(error.message || 'Failed to fetch orders');
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
			const response = await api.post('/orders', data);
			return response.data;
		} catch (error: any) {
			return rejectWithValue(error.message || 'Failed to create order');
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
			const response = await api.patch(`/orders/${id}`, { status });
			return response.data;
		} catch (error: any) {
			return rejectWithValue(error.message || 'Failed to update order status');
		}
	}
);

// Initial state
const initialState: OrdersState = {
	orders: [],
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
		builder.addCase(
			fetchOrders.fulfilled,
			(state, action: PayloadAction<Order[]>) => {
				state.loading = false;
				state.orders = action.payload;
			}
		);
		builder.addCase(fetchOrders.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});

		// Create order
		builder.addCase(createOrder.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(
			createOrder.fulfilled,
			(state, action: PayloadAction<Order>) => {
				state.loading = false;
				state.orders.push(action.payload);
			}
		);
		builder.addCase(createOrder.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});

		// Update order status
		builder.addCase(updateOrderStatus.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(
			updateOrderStatus.fulfilled,
			(state, action: PayloadAction<Order>) => {
				state.loading = false;
				const index = state.orders.findIndex(
					order => order.id === action.payload.id
				);
				if (index !== -1) {
					state.orders[index] = action.payload;
				}
			}
		);
		builder.addCase(updateOrderStatus.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});
	}
});

export const { clearError } = ordersSlice.actions;

export default ordersSlice.reducer;
