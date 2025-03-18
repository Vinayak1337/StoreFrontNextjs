// This file is used to initialize MSW in development mode
export async function initializeMocks() {
	if (typeof window === 'undefined') {
		const { server } = await import('@/mocks/node');
		server.listen({ onUnhandledRequest: 'bypass' });
	} else {
		const { worker } = await import('@/mocks/browser');
		worker.start({ onUnhandledRequest: 'bypass' });
	}
}

// Auto-initialize if loaded directly
initializeMocks().catch(err => console.error('Error initializing mocks', err));

export {};
