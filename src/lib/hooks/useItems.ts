import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/services/api';

export function useItems() {
	return useQuery({
		queryKey: ['items'],
		queryFn: () => api.getAllItems()
	});
}

export function useCategories() {
	return useQuery({
		queryKey: ['categories'],
		queryFn: () => api.getAllCategories()
	});
}

export function useItem(id: string) {
	return useQuery({
		queryKey: ['item', id],
		queryFn: () => api.getItemById(id),
		enabled: !!id
	});
}

export function useCreateItem() {
	const router = useRouter();

	return async (data: Omit<Item, 'id' | 'createdAt'>) => {
		await api.createItem(data);
		router.refresh();
	};
}

export function useUpdateItem() {
	const router = useRouter();

	return async ({ id, data }: { id: string; data: Partial<Item> }) => {
		await api.updateItem(id, data);
		router.refresh();
	};
}

export function useDeleteItem() {
	const router = useRouter();

	return async (id: string) => {
		await api.deleteItem(id);
		router.refresh();
	};
}
