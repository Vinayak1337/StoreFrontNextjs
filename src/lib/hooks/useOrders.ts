import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/services/api';
import { Order, OrderStatus } from '@/types';

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
		mutationFn: (data: Omit<Order, 'id' | 'createdAt'>) =>
			api.createOrder(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['orders'] });
		}
	});
}

// Hook for updating an order status
export function useUpdateOrderStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
			api.updateOrderStatus(id, status),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['orders'] });
			queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
		}
	});
}
