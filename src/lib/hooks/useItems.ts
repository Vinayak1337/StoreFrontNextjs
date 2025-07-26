import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/services/api';

// Hook for fetching all items
export function useItems() {
	return useQuery({
		queryKey: ['items'],
		queryFn: () => api.getAllItems()
	});
}

// Hook for fetching all categories
export function useCategories() {
	return useQuery({
		queryKey: ['categories'],
		queryFn: () => api.getAllCategories()
	});
}

// Hook for fetching a single item
export function useItem(id: string) {
	return useQuery({
		queryKey: ['item', id],
		queryFn: () => api.getItemById(id),
		enabled: !!id
	});
}

// Hook for creating a new item
export function useCreateItem() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: (data: Omit<Item, 'id' | 'createdAt'>) =>
			api.createItem(data),
		onSuccess: () => {
			// Invalidate React Query cache
			queryClient.invalidateQueries({ queryKey: ['items'] });
			queryClient.invalidateQueries({ queryKey: ['categories'] });
			queryClient.invalidateQueries({ queryKey: ['uncategorizedItems'] });
			queryClient.invalidateQueries({ queryKey: ['categorizedItems'] });
			
			// Refresh server components
			router.refresh();
		}
	});
}

// Hook for updating an item
export function useUpdateItem() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<Item> }) =>
			api.updateItem(id, data),
		onSuccess: (_, variables) => {
			// Invalidate React Query cache
			queryClient.invalidateQueries({ queryKey: ['items'] });
			queryClient.invalidateQueries({ queryKey: ['categories'] });
			queryClient.invalidateQueries({ queryKey: ['uncategorizedItems'] });
			queryClient.invalidateQueries({ queryKey: ['categorizedItems'] });
			queryClient.invalidateQueries({ queryKey: ['item', variables.id] });
			
			// Refresh server components
			router.refresh();
		}
	});
}

// Hook for deleting an item
export function useDeleteItem() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: (id: string) => api.deleteItem(id),
		onSuccess: () => {
			// Invalidate React Query cache
			queryClient.invalidateQueries({ queryKey: ['items'] });
			queryClient.invalidateQueries({ queryKey: ['categories'] });
			queryClient.invalidateQueries({ queryKey: ['uncategorizedItems'] });
			queryClient.invalidateQueries({ queryKey: ['categorizedItems'] });
			
			// Refresh server components
			router.refresh();
		}
	});
}