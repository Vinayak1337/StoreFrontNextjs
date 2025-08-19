import { fetchWithCsrf } from '@/lib/client/csrf-utils';

async function fetchAPI<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {
	const url = `/api${endpoint}`;

	const headers = {
		'Content-Type': 'application/json',
		...options.headers
	};

	try {
		const response = await fetchWithCsrf(url, { ...options, headers });

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.error || `API call failed with status ${response.status}`
			);
		}

		if (response.status === 204) {
			return {} as T;
		}

		return await response.json();
	} catch (error) {
		console.error(`Error calling ${url}:`, error);
		throw error;
	}
}

export const userAPI = {
	getCurrentUser: () =>
		fetchAPI<{ id: string; name: string; email: string }>('/user')
};

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

export const itemsAPI = {
	getAllItems: () => fetchAPI<Item[]>('/items'),

	getItemsPaginated: (page: number = 1, limit: number = 100) =>
		fetchAPI<PaginatedResponse<Item>>(`/items?page=${page}&limit=${limit}`),

	getUncategorizedItems: (page: number = 1, limit: number = 50) =>
		fetchAPI<PaginatedResponse<Item>>(
			`/items/uncategorized?page=${page}&limit=${limit}`
		),

	getItemsByCategory: (
		categoryId: string,
		page: number = 1,
		limit: number = 50
	) =>
		fetchAPI<PaginatedResponse<Item>>(
			`/categories/${categoryId}/items?page=${page}&limit=${limit}`
		),

	getItemById: (id: string) => fetchAPI<Item>(`/items/${id}`),

	createItem: (item: Omit<Item, 'id' | 'createdAt'>) =>
		fetchAPI<Item>('/items', {
			method: 'POST',
			body: JSON.stringify(item)
		}),

	updateItem: (id: string, item: Partial<Item>) =>
		fetchAPI<Item>(`/items/${id}`, {
			method: 'PUT',
			body: JSON.stringify(item)
		}),

	deleteItem: (id: string) =>
		fetchAPI<{ success: boolean }>(`/items/${id}`, {
			method: 'DELETE'
		}),

	addItemToCategory: (categoryId: string, itemId: string) =>
		fetchAPI<{ id: string; itemId: string; categoryId: string }>(
			`/categories/${categoryId}/items`,
			{
				method: 'POST',
				body: JSON.stringify({ itemId })
			}
		),

	removeItemFromCategory: (categoryId: string, itemId: string) =>
		fetchAPI<{ message: string }>(
			`/categories/${categoryId}/items?itemId=${itemId}`,
			{
				method: 'DELETE'
			}
		)
};

export const ordersAPI = {
	getAllOrders: () => fetchAPI<Order[]>('/orders'),

	getOrderById: (id: string) => fetchAPI<Order>(`/orders/${id}`),

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
				items: order.orderItems,
				customMessage: order.customMessage
			})
		}),

	updateOrder: (
		id: string,
		data: { customerName?: string; customMessage?: string }
	) =>
		fetchAPI<Order>(`/orders/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		}),

	deleteOrder: async (id: string) => {
		const response = await fetchWithCsrf(`/api/orders/${id}`, {
			method: 'DELETE'
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to delete order');
		}

		return id;
	},

	archiveOrder: async (id: string) => {
		const response = await fetchWithCsrf(`/api/orders/${id}/archive`, {
			method: 'POST'
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to archive order');
		}

		return id;
	},

	unarchiveOrder: async (id: string) => {
		const response = await fetchWithCsrf(`/api/orders/${id}/unarchive`, {
			method: 'POST'
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to unarchive order');
		}

		return id;
	}
};


export const categoriesAPI = {
	getAllCategories: () => fetchAPI<Category[]>('/categories'),

	getCategoryById: (id: string) => fetchAPI<Category>(`/categories/${id}`),

	createCategory: (category: {
		name: string;
		color?: string;
		order?: number;
	}) =>
		fetchAPI<Category>('/categories', {
			method: 'POST',
			body: JSON.stringify(category)
		}),

	updateCategory: (
		id: string,
		data: { name?: string; color?: string; order?: number }
	) =>
		fetchAPI<Category>(`/categories/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		}),

	deleteCategory: (id: string) =>
		fetchAPI<{ message: string }>(`/categories/${id}`, {
			method: 'DELETE'
		})
};


const api = {
	...userAPI,
	...itemsAPI,
	...ordersAPI,
	...categoriesAPI
};

export default api;
