import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ItemsState } from '@/types';
import api from '@/lib/services/api';

// Async thunks
export const fetchItems = createAsyncThunk(
	'items/fetchItems',
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get('/items');
			return response.data;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to fetch items');
		}
	}
);

export const createItem = createAsyncThunk(
	'items/createItem',
	async (data: Omit<Item, 'id' | 'createdAt'>, { rejectWithValue }) => {
		try {
			const response = await api.post('/items', data);
			return response.data;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to create item');
		}
	}
);

export const updateItem = createAsyncThunk(
	'items/updateItem',
	async (
		{ id, data }: { id: string; data: Partial<Item> },
		{ rejectWithValue }
	) => {
		try {
			const response = await api.put(`/items/${id}`, data);
			return response.data;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to update item');
		}
	}
);

export const deleteItem = createAsyncThunk(
	'items/deleteItem',
	async (id: string, { rejectWithValue }) => {
		try {
			await api.delete(`/items/${id}`);
			return id;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to delete item');
		}
	}
);

// Initial state
const initialState: ItemsState = {
	items: [],
	activeItem: null,
	loading: false,
	error: null
};

// Create the slice
const itemsSlice = createSlice({
	name: 'items',
	initialState,
	reducers: {
		// Fetch items
		fetchItemsStart: state => {
			state.loading = true;
			state.error = null;
		},
		fetchItemsSuccess: (state, { payload }) => {
			state.items = payload;
			state.loading = false;
		},
		fetchItemsFailure: (state, { payload }) => {
			state.loading = false;
			state.error = payload;
		},

		// Fetch single item
		fetchItemStart: state => {
			state.loading = true;
			state.error = null;
		},
		fetchItemSuccess: (state, { payload }) => {
			state.activeItem = payload;
			state.loading = false;
		},
		fetchItemFailure: (state, { payload }) => {
			state.loading = false;
			state.error = payload;
		},

		// Create item
		createItemStart: state => {
			state.loading = true;
			state.error = null;
		},
		createItemSuccess: (state, { payload }) => {
			state.items = [payload, ...state.items];
			state.activeItem = payload;
			state.loading = false;
		},
		createItemFailure: (state, { payload }) => {
			state.loading = false;
			state.error = payload;
		},

		// Update item
		updateItemStart: state => {
			state.loading = true;
			state.error = null;
		},
		updateItemSuccess: (state, { payload }) => {
			state.items = state.items.map(item =>
				item.id === payload.id ? payload : item
			);
			state.activeItem = payload;
			state.loading = false;
		},
		updateItemFailure: (state, { payload }) => {
			state.loading = false;
			state.error = payload;
		},

		// Delete item
		deleteItemStart: state => {
			state.loading = true;
			state.error = null;
		},
		deleteItemSuccess: (state, { payload }) => {
			state.items = state.items.filter(item => item.id !== payload);
			if (state.activeItem?.id === payload) {
				state.activeItem = null;
			}
			state.loading = false;
		},
		deleteItemFailure: (state, { payload }) => {
			state.loading = false;
			state.error = payload;
		},

		// Set active item
		setActiveItem: (state, { payload }) => {
			state.activeItem = payload;
		},

		// Clear error
		clearError: state => {
			state.error = null;
		}
	},
	extraReducers: builder => {
		// Fetch items
		builder.addCase(fetchItems.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(fetchItems.fulfilled, (state, { payload }) => {
			state.loading = false;
			state.items = payload;
		});
		builder.addCase(fetchItems.rejected, (state, { payload }) => {
			state.loading = false;
			state.error = payload as string;
		});

		// Create item
		builder.addCase(createItem.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(createItem.fulfilled, (state, { payload }) => {
			state.loading = false;
			state.items.push(payload);
		});
		builder.addCase(createItem.rejected, (state, { payload }) => {
			state.loading = false;
			state.error = payload as string;
		});

		// Update item
		builder.addCase(updateItem.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(updateItem.fulfilled, (state, { payload }) => {
			state.loading = false;
			const index = state.items.findIndex(item => item.id === payload.id);
			if (index !== -1) {
				state.items[index] = payload;
			}
		});
		builder.addCase(updateItem.rejected, (state, { payload }) => {
			state.loading = false;
			state.error = payload as string;
		});

		// Delete item
		builder.addCase(deleteItem.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(deleteItem.fulfilled, (state, { payload }) => {
			state.loading = false;
			state.items = state.items.filter(item => item.id !== payload);
		});
		builder.addCase(deleteItem.rejected, (state, { payload }) => {
			state.loading = false;
			state.error = payload as string;
		});
	}
});

export const {
	fetchItemsStart,
	fetchItemsSuccess,
	fetchItemsFailure,
	fetchItemStart,
	fetchItemSuccess,
	fetchItemFailure,
	createItemStart,
	createItemSuccess,
	createItemFailure,
	updateItemStart,
	updateItemSuccess,
	updateItemFailure,
	deleteItemStart,
	deleteItemSuccess,
	deleteItemFailure,
	setActiveItem,
	clearError
} = itemsSlice.actions;

export default itemsSlice.reducer;
