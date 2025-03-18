import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Item, ItemsState } from '@/types';
import api from '@/services/api';

// Async thunks
export const fetchItems = createAsyncThunk(
	'items/fetchItems',
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get('/items');
			return response.data;
		} catch (error: any) {
			return rejectWithValue(error.message || 'Failed to fetch items');
		}
	}
);

export const createItem = createAsyncThunk(
	'items/createItem',
	async (data: Omit<Item, 'id'>, { rejectWithValue }) => {
		try {
			const response = await api.post('/items', data);
			return response.data;
		} catch (error: any) {
			return rejectWithValue(error.message || 'Failed to create item');
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
		} catch (error: any) {
			return rejectWithValue(error.message || 'Failed to update item');
		}
	}
);

export const deleteItem = createAsyncThunk(
	'items/deleteItem',
	async (id: string, { rejectWithValue }) => {
		try {
			await api.delete(`/items/${id}`);
			return id;
		} catch (error: any) {
			return rejectWithValue(error.message || 'Failed to delete item');
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
		fetchItemsSuccess: (state, action: PayloadAction<Item[]>) => {
			state.items = action.payload;
			state.loading = false;
		},
		fetchItemsFailure: (state, action: PayloadAction<string>) => {
			state.loading = false;
			state.error = action.payload;
		},

		// Fetch single item
		fetchItemStart: (state, action: PayloadAction<string>) => {
			state.loading = true;
			state.error = null;
		},
		fetchItemSuccess: (state, action: PayloadAction<Item>) => {
			state.activeItem = action.payload;
			state.loading = false;
		},
		fetchItemFailure: (state, action: PayloadAction<string>) => {
			state.loading = false;
			state.error = action.payload;
		},

		// Create item
		createItemStart: (
			state,
			action: PayloadAction<Omit<Item, 'id' | 'createdAt'>>
		) => {
			state.loading = true;
			state.error = null;
		},
		createItemSuccess: (state, action: PayloadAction<Item>) => {
			state.items = [action.payload, ...state.items];
			state.activeItem = action.payload;
			state.loading = false;
		},
		createItemFailure: (state, action: PayloadAction<string>) => {
			state.loading = false;
			state.error = action.payload;
		},

		// Update item
		updateItemStart: (
			state,
			action: PayloadAction<{ id: string; data: Partial<Item> }>
		) => {
			state.loading = true;
			state.error = null;
		},
		updateItemSuccess: (state, action: PayloadAction<Item>) => {
			state.items = state.items.map(item =>
				item.id === action.payload.id ? action.payload : item
			);
			state.activeItem = action.payload;
			state.loading = false;
		},
		updateItemFailure: (state, action: PayloadAction<string>) => {
			state.loading = false;
			state.error = action.payload;
		},

		// Delete item
		deleteItemStart: (state, action: PayloadAction<string>) => {
			state.loading = true;
			state.error = null;
		},
		deleteItemSuccess: (state, action: PayloadAction<string>) => {
			state.items = state.items.filter(item => item.id !== action.payload);
			if (state.activeItem?.id === action.payload) {
				state.activeItem = null;
			}
			state.loading = false;
		},
		deleteItemFailure: (state, action: PayloadAction<string>) => {
			state.loading = false;
			state.error = action.payload;
		},

		// Set active item
		setActiveItem: (state, action: PayloadAction<Item | null>) => {
			state.activeItem = action.payload;
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
		builder.addCase(
			fetchItems.fulfilled,
			(state, action: PayloadAction<Item[]>) => {
				state.loading = false;
				state.items = action.payload;
			}
		);
		builder.addCase(fetchItems.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});

		// Create item
		builder.addCase(createItem.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(
			createItem.fulfilled,
			(state, action: PayloadAction<Item>) => {
				state.loading = false;
				state.items.push(action.payload);
			}
		);
		builder.addCase(createItem.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});

		// Update item
		builder.addCase(updateItem.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(
			updateItem.fulfilled,
			(state, action: PayloadAction<Item>) => {
				state.loading = false;
				const index = state.items.findIndex(
					item => item.id === action.payload.id
				);
				if (index !== -1) {
					state.items[index] = action.payload;
				}
			}
		);
		builder.addCase(updateItem.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});

		// Delete item
		builder.addCase(deleteItem.pending, state => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(
			deleteItem.fulfilled,
			(state, action: PayloadAction<string>) => {
				state.loading = false;
				state.items = state.items.filter(item => item.id !== action.payload);
			}
		);
		builder.addCase(deleteItem.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
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
