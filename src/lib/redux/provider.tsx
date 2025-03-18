'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { ReactQueryProvider } from '../providers/query-provider';

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<Provider store={store}>
			<ReactQueryProvider>{children}</ReactQueryProvider>
		</Provider>
	);
}
