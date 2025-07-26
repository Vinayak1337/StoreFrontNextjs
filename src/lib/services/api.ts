import { fetchWithCsrf } from '@/lib/client/csrf-utils';

// Generic fetch function with error handling
async function fetchAPI<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {
	const url = `/api${endpoint}`;

	// Set default headers
	const headers = {
		'Content-Type': 'application/json',
		...options.headers
	};

	try {
		// Use fetchWithCsrf instead of native fetch for automatic CSRF handling
		const response = await fetchWithCsrf(url, { ...options, headers });

		// Check if the request was successful
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.error || `API call failed with status ${response.status}`
			);
		}

		// For 204 No Content responses, return without attempting to parse JSON
		if (response.status === 204) {
			return {} as T;
		}

		return await response.json();
	} catch (error) {
		console.error(`Error calling ${url}:`, error);
		throw error;
	}
}

// User API service
export const userAPI = {
	// Get current user
	getCurrentUser: () =>
		fetchAPI<{ id: string; name: string; email: string }>('/user')
};

// Pagination interface
interface PaginatedResponse<T> {
	items: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

// Items API service
export const itemsAPI = {
	// Get all items (legacy mode)
	getAllItems: () => fetchAPI<Item[]>('/items'),

	// Get items with pagination
	getItemsPaginated: (page: number = 1, limit: number = 100) =>
		fetchAPI<PaginatedResponse<Item>>(`/items?page=${page}&limit=${limit}`),

	// Get uncategorized items with pagination
	getUncategorizedItems: (page: number = 1, limit: number = 50) =>
		fetchAPI<PaginatedResponse<Item>>(`/items/uncategorized?page=${page}&limit=${limit}`),

	// Get items by category with pagination
	getItemsByCategory: (categoryId: string, page: number = 1, limit: number = 50) =>
		fetchAPI<PaginatedResponse<Item>>(`/categories/${categoryId}/items?page=${page}&limit=${limit}`),

	// Get item by ID
	getItemById: (id: string) => fetchAPI<Item>(`/items/${id}`),

	// Create a new item
	createItem: (item: Omit<Item, 'id' | 'createdAt'>) =>
		fetchAPI<Item>('/items', {
			method: 'POST',
			body: JSON.stringify(item)
		}),

	// Update an item
	updateItem: (id: string, item: Partial<Item>) =>
		fetchAPI<Item>(`/items/${id}`, {
			method: 'PUT',
			body: JSON.stringify(item)
		}),

	// Delete an item
	deleteItem: (id: string) =>
		fetchAPI<{ success: boolean }>(`/items/${id}`, {
			method: 'DELETE'
		}),

	// Add item to category
	addItemToCategory: (categoryId: string, itemId: string) =>
		fetchAPI<{ id: string; itemId: string; categoryId: string }>(`/categories/${categoryId}/items`, {
			method: 'POST',
			body: JSON.stringify({ itemId })
		}),

	// Remove item from category
	removeItemFromCategory: (categoryId: string, itemId: string) =>
		fetchAPI<{ message: string }>(`/categories/${categoryId}/items?itemId=${itemId}`, {
			method: 'DELETE'
		})
};

// Orders API service
export const ordersAPI = {
	// Get all orders
	getAllOrders: () => fetchAPI<Order[]>('/orders'),

	// Get order by ID
	getOrderById: (id: string) => fetchAPI<Order>(`/orders/${id}`),

	// Create a new order
	createOrder: (order: {
		customerName: string;
		orderItems: Array<{
			itemId: string;
			quantity: number;
			price: number;
		}>;
		customMessage?: string;
	}) =>
		fetchAPI<Order>('/orders', {
			method: 'POST',
			body: JSON.stringify({
				customerName: order.customerName,
				items: order.orderItems, // Backend expects 'items' array
				customMessage: order.customMessage
			})
		}),

	// Update order
	updateOrder: (id: string, data: { customerName?: string; customMessage?: string }) =>
		fetchAPI<Order>(`/orders/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		}),

	// Delete an order
	deleteOrder: async (id: string) => {
		// Use fetchWithCsrf for direct fetch calls too
		const response = await fetchWithCsrf(`/api/orders/${id}`, {
			method: 'DELETE'
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to delete order');
		}

		return id; // Just return the ID instead of parsing the response
	}
};

// Bills API service
export const billsAPI = {
	// Get all bills
	getAllBills: () => fetchAPI<Bill[]>('/bills'),

	// Get bill by ID
	getBillById: (id: string) => fetchAPI<Bill>(`/bills/${id}`),

	// Create a new bill
	createBill: (bill: Partial<Bill>) =>
		fetchAPI<Bill>('/bills', {
			method: 'POST',
			body: JSON.stringify(bill)
		}),

	// Update a bill
	updateBill: (id: string, data: Partial<Bill>) =>
		fetchAPI<Bill>(`/bills/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		}),

	// Delete a bill
	deleteBill: async (id: string) => {
		// Use fetchWithCsrf for direct fetch calls too
		const response = await fetchWithCsrf(`/api/bills/${id}`, {
			method: 'DELETE'
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to delete bill');
		}

		return id; // Just return the ID instead of parsing the response
	}
};

// Categories API service
export const categoriesAPI = {
	// Get all categories
	getAllCategories: () => fetchAPI<Category[]>('/categories'),

	// Get category by ID
	getCategoryById: (id: string) => fetchAPI<Category>(`/categories/${id}`),

	// Create a new category
	createCategory: (category: { name: string; color?: string; order?: number }) =>
		fetchAPI<Category>('/categories', {
			method: 'POST',
			body: JSON.stringify(category)
		}),

	// Update a category
	updateCategory: (id: string, data: { name?: string; color?: string; order?: number }) =>
		fetchAPI<Category>(`/categories/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		}),

	// Delete a category
	deleteCategory: (id: string) =>
		fetchAPI<{ message: string }>(`/categories/${id}`, {
			method: 'DELETE'
		})
};

// Analytics API service
export const analyticsAPI = {
	// Get daily sales data with optional date range
	getDailySales: (startDate?: string, endDate?: string) => {
		let url = '/analytics/daily-sales';
		const params = new URLSearchParams();

		if (startDate) params.append('startDate', startDate);
		if (endDate) params.append('endDate', endDate);

		if (params.toString()) {
			url += `?${params.toString()}`;
		}

		interface DailySalesData {
			date: string;
			sales: number;
			orderCount: number;
		}

		return fetchAPI<DailySalesData[]>(url);
	},

	// Get analytics metrics
	getMetrics: () => fetchAPI<AnalyticsMetrics>('/analytics/metrics')
};

// Default export combining all API services
const api = {
	...userAPI,
	...itemsAPI,
	...ordersAPI,
	...billsAPI,
	...categoriesAPI,
	...analyticsAPI
};

export default api;
