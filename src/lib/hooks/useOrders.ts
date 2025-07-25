import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/services/api';

// Hook for fetching all orders
export function useOrders() {
	return useQuery({
		queryKey: ['orders'],
		queryFn: () => api.getAllOrders()
	});
}

// Hook for fetching a single order
export function useOrder(id: string) {
	return useQuery({
		queryKey: ['order', id],
		queryFn: () => api.getOrderById(id),
		enabled: !!id
	});
}

// Hook for creating a new order
export function useCreateOrder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: {
			customerName: string;
			orderItems: Array<{
				itemId: string;
				quantity: number;
				price: number;
			}>;
			customMessage?: string;
		}) => api.createOrder(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['orders'] });
		}
	});
}

// Hook for updating an order
export function useUpdateOrder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: { customerName?: string; customMessage?: string } }) =>
			api.updateOrder(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['orders'] });
			queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
		}
	});
}
