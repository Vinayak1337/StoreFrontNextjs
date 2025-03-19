'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to dashboard when loaded
		router.push('/dashboard');
	}, [router]);

	return (
		<div className='flex h-screen w-full items-center justify-center'>
			<div className='animate-pulse'>
				<div className='h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin'></div>
			</div>
		</div>
	);
}
