'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useRefreshItems() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const refreshItems = useCallback(() => {
		// Invalidate React Query cache
		queryClient.invalidateQueries({ queryKey: ['items'] });
		queryClient.invalidateQueries({ queryKey: ['categories'] });
		queryClient.invalidateQueries({ queryKey: ['uncategorizedItems'] });
		queryClient.invalidateQueries({ queryKey: ['categorizedItems'] });
		
		// Refresh server components (this will trigger the server cache invalidation)
		router.refresh();
	}, [router, queryClient]);

	return refreshItems;
}