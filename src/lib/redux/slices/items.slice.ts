import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ItemsState, Item, Category } from '@/types';
import api from '@/lib/services/api';

// Async thunks
export const fetchItems = createAsyncThunk(
	'items/fetchItems',
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.getAllItems();
			return response;
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
	async (item: Omit<Item, 'id' | 'createdAt'>, { rejectWithValue }) => {
		try {
			const response = await api.createItem(item);
			return response;
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
		{ id, item }: { id: string; item: Partial<Item> },
		{ rejectWithValue }
	) => {
		try {
			const response = await api.updateItem(id, item);
			return response;
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
			await api.deleteItem(id);
			return id;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to delete item');
		}
	}
);

// Category async thunks
export const fetchCategories = createAsyncThunk(
	'items/fetchCategories',
	async (_, { rejectWithValue }) => {
		try {
			const response = await fetch('/api/categories');
			const data = await response.json();
			
			if (!response.ok) {
				return rejectWithValue(data.error || 'Failed to fetch categories');
			}
			
			return data;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to fetch categories');
		}
	}
);

export const createCategory = createAsyncThunk(
	'items/createCategory',
	async (category: Omit<Category, 'id' | 'createdAt' | '_count'>, { rejectWithValue }) => {
		try {
			const response = await fetch('/api/categories', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(category)
			});
			const data = await response.json();
			
			if (!response.ok) {
				return rejectWithValue(data.error || 'Failed to create category');
			}
			
			return data;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to create category');
		}
	}
);

export const updateCategory = createAsyncThunk(
	'items/updateCategory',
	async (
		{ id, category }: { id: string; category: Partial<Category> },
		{ rejectWithValue }
	) => {
		try {
			const response = await fetch(`/api/categories/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(category)
			});
			const data = await response.json();
			
			if (!response.ok) {
				return rejectWithValue(data.error || 'Failed to update category');
			}
			
			return data;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to update category');
		}
	}
);

export const deleteCategory = createAsyncThunk(
	'items/deleteCategory',
	async (id: string, { rejectWithValue }) => {
		try {
			const response = await fetch(`/api/categories/${id}`, {
				method: 'DELETE'
			});
			const data = await response.json();
			
			if (!response.ok) {
				return rejectWithValue(data.error || 'Failed to delete category');
			}
			
			return id;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to delete category');
		}
	}
);

export const addItemToCategory = createAsyncThunk(
	'items/addItemToCategory',
	async (
		{ categoryId, itemId }: { categoryId: string; itemId: string },
		{ rejectWithValue }
	) => {
		try {
			const response = await api.addItemToCategory(categoryId, itemId);
			return response;
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to add item to category');
		}
	}
);

export const removeItemFromCategory = createAsyncThunk(
	'items/removeItemFromCategory',
	async (
		{ categoryId, itemId }: { categoryId: string; itemId: string },
		{ rejectWithValue }
	) => {
		try {
			await api.removeItemFromCategory(categoryId, itemId);
			return { categoryId, itemId };
		} catch (error) {
			if (error instanceof Error) {
				return rejectWithValue(error.message);
			}
			return rejectWithValue('Failed to remove item from category');
		}
	}
);

// Initial state
const initialState: ItemsState = {
	items: [],
	categories: [],
	activeItem: null,
	activeCategory: null,
	loading: false,
	categoryLoading: false,
	error: null,
	categoryError: null
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
			state.items = state.items.map((item: Item) =>
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

		// Set active category
		setActiveCategory: (state, { payload }) => {
			state.activeCategory = payload;
		},

		// Clear error
		clearError: state => {
			state.error = null;
			state.categoryError = null;
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
			state.items = [payload, ...state.items];
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

		// Fetch categories
		builder.addCase(fetchCategories.pending, state => {
			state.categoryLoading = true;
			state.categoryError = null;
		});
		builder.addCase(fetchCategories.fulfilled, (state, { payload }) => {
			state.categoryLoading = false;
			state.categories = payload;
		});
		builder.addCase(fetchCategories.rejected, (state, { payload }) => {
			state.categoryLoading = false;
			state.categoryError = payload as string;
		});

		// Create category
		builder.addCase(createCategory.pending, state => {
			state.categoryLoading = true;
			state.categoryError = null;
		});
		builder.addCase(createCategory.fulfilled, (state, { payload }) => {
			state.categoryLoading = false;
			state.categories = [...state.categories, payload];
		});
		builder.addCase(createCategory.rejected, (state, { payload }) => {
			state.categoryLoading = false;
			state.categoryError = payload as string;
		});

		// Update category
		builder.addCase(updateCategory.pending, state => {
			state.categoryLoading = true;
			state.categoryError = null;
		});
		builder.addCase(updateCategory.fulfilled, (state, { payload }) => {
			state.categoryLoading = false;
			const index = state.categories.findIndex(cat => cat.id === payload.id);
			if (index !== -1) {
				state.categories[index] = payload;
			}
		});
		builder.addCase(updateCategory.rejected, (state, { payload }) => {
			state.categoryLoading = false;
			state.categoryError = payload as string;
		});

		// Delete category
		builder.addCase(deleteCategory.pending, state => {
			state.categoryLoading = true;
			state.categoryError = null;
		});
		builder.addCase(deleteCategory.fulfilled, (state, { payload }) => {
			state.categoryLoading = false;
			state.categories = state.categories.filter(cat => cat.id !== payload);
		});
		builder.addCase(deleteCategory.rejected, (state, { payload }) => {
			state.categoryLoading = false;
			state.categoryError = payload as string;
		});

		// Add item to category
		builder.addCase(addItemToCategory.pending, state => {
			state.categoryLoading = true;
			state.categoryError = null;
		});
		builder.addCase(addItemToCategory.fulfilled, (state, { meta }) => {
			state.categoryLoading = false;
			// Update the items state directly
			const { categoryId, itemId } = meta.arg;
			const item = state.items.find(item => item.id === itemId);
			if (item) {
				// Remove from any existing categories first
				item.categories = item.categories?.filter(cat => cat.categoryId !== categoryId) || [];
				// Add to the new category (create a proper ItemCategory object)
				item.categories.push({
					id: `temp_${Date.now()}`, // Temporary ID - real data will come from fetch
					itemId: itemId,
					categoryId: categoryId,
					createdAt: new Date().toISOString()
				});
			}
		});
		builder.addCase(addItemToCategory.rejected, (state, { payload }) => {
			state.categoryLoading = false;
			state.categoryError = payload as string;
		});

		// Remove item from category
		builder.addCase(removeItemFromCategory.pending, state => {
			state.categoryLoading = true;
			state.categoryError = null;
		});
		builder.addCase(removeItemFromCategory.fulfilled, (state, { meta }) => {
			state.categoryLoading = false;
			// Update the items state directly
			const { categoryId, itemId } = meta.arg;
			const item = state.items.find(item => item.id === itemId);
			if (item) {
				// Remove from the specified category
				item.categories = item.categories?.filter(cat => cat.categoryId !== categoryId) || [];
			}
		});
		builder.addCase(removeItemFromCategory.rejected, (state, { payload }) => {
			state.categoryLoading = false;
			state.categoryError = payload as string;
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
	setActiveCategory,
	clearError
} = itemsSlice.actions;

export default itemsSlice.reducer;
