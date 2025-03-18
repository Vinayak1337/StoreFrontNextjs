'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Disable SSR for the DashboardContent component
const DashboardContent = dynamic(() => import('./dashboard-content'), {
	ssr: false,
	loading: () => <div>Loading dashboard...</div>
});

export default function DashboardPage() {
	return (
		<Suspense fallback={<div>Loading dashboard...</div>}>
			<DashboardContent />
		</Suspense>
	);
}
