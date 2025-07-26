'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export function RefreshButton() {
	const router = useRouter();
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleRefresh = () => {
		setIsRefreshing(true);
		
		// Refresh the page to get fresh server-side data
		router.refresh();
		
		// Reset loading state after a short delay
		setTimeout(() => {
			setIsRefreshing(false);
		}, 1000);
	};

	return (
		<button
			onClick={handleRefresh}
			disabled={isRefreshing}
			className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
			<RefreshCw
				className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
			/>
		</button>
	);
}