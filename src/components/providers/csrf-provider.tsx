'use client';

import React, { useEffect, useState } from 'react';
import { getCsrfToken } from '@/lib/client/csrf-utils';

interface CsrfProviderProps {
	children: React.ReactNode;
}

export default function CsrfProvider({ children }: CsrfProviderProps) {
	const [isTokenLoaded, setIsTokenLoaded] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchCsrfToken = async () => {
			try {
				await getCsrfToken();
				setIsTokenLoaded(true);
			} catch (err) {
				console.error('Error preloading CSRF token:', err);
				setError(
					'Failed to load security token. Some features may not work correctly.'
				);
			}
		};

		fetchCsrfToken();
	}, []);

	if (error) {
		return (
			<div className='fixed top-0 left-0 right-0 bg-destructive text-white p-2 text-center z-50'>
				{error}
			</div>
		);
	}

	// Don't block rendering, just initialize the token in the background
	return <>{children}</>;
}
