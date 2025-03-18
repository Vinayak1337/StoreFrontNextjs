'use client';

export const initMocks = async () => {
	if (typeof window === 'undefined') {
		return;
	}

	const { worker } = await import('./browser');
	await worker.start({
		onUnhandledRequest: 'bypass'
	});

	console.log('Mock Service Worker initialized');
};
