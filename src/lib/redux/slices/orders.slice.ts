import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { OrdersState } from '@/types';
import api from '@/lib/services/api';
import { toast } from 'react-toastify';

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
			orderItems: Array<{
				itemId: string;
				quantity: number;
				price: number;
			}>;
			customMessage?: string;
		},
		{ rejectWithValue }
	) => {
		try {
			const response = await api.createOrder(data);
			return response;
		} catch (error) {
			if (error instanceof Error) {
				// Handle specific error types
				if (error.message.includes('Transaction already closed') || 
				    error.message.includes('timeout') || 
				    error.message.includes('Transaction API error')) {
					return rejectWithValue('Order creation timed out. Please try again with fewer items or check your connection.');
				}
				
				if (error.message.includes('not found')) {
					return rejectWithValue('One or more selected items are no longer available. Please refresh and try again.');
				}
				
				if (error.message.includes('out of stock')) {
					return rejectWithValue('One or more selected items are out of stock. Please remove them and try again.');
				}
				
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to create order. Please try again.');
		}
	}
);

export const updateOrder = createAsyncThunk(
	'orders/updateOrder',
	async (
		{ id, data }: { id: string; data: { customerName?: string; customMessage?: string } },
		{ rejectWithValue }
	) => {
		try {
			const response = await api.updateOrder(id, data);
			return response;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to update order');
		}
	}
);

export const deleteOrder = createAsyncThunk(
	'orders/deleteOrder',
	async (id: string, { rejectWithValue }) => {
		try {
			await api.deleteOrder(id);
			return id;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to delete order');
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
			toast.error(`Failed to fetch orders: ${payload}`);
		});

		// Create order
		builder.addCase(createOrder.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(createOrder.fulfilled, (state, { payload }) => {
			state.loading = false;
			state.orders.push(payload);
			toast.success('Order created successfully!');
		});
		builder.addCase(createOrder.rejected, (state, { payload }) => {
			state.loading = false;
			state.error = payload as string;
			toast.error(`Failed to create order: ${payload}`);
		});

		// Update order
		builder.addCase(updateOrder.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(updateOrder.fulfilled, (state, { payload }) => {
			state.loading = false;
			const index = state.orders.findIndex(order => order.id === payload.id);
			if (index !== -1) {
				state.orders[index] = payload;
			}
			toast.success('Order updated successfully!');
		});
		builder.addCase(updateOrder.rejected, (state, { payload }) => {
			state.loading = false;
			state.error = payload as string;
			toast.error(`Failed to update order: ${payload}`);
		});

		// Delete order
		builder.addCase(deleteOrder.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(deleteOrder.fulfilled, (state, { payload }) => {
			state.loading = false;
			state.orders = state.orders.filter(order => order.id !== payload);
			toast.success('Order deleted successfully!');
		});
		builder.addCase(deleteOrder.rejected, (state, { payload }) => {
			state.loading = false;
			state.error = payload as string;
			toast.error(`Failed to delete order: ${payload}`);
		});
	}
});

export const { clearError } = ordersSlice.actions;

export default ordersSlice.reducer;
