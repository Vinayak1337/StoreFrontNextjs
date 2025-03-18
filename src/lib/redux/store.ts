import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import itemsReducer from './slices/items.slice';
import ordersReducer from './slices/orders.slice';
import billsReducer from './slices/bills.slice';
import analyticsReducer from './slices/analytics.slice';

export const store = configureStore({
	reducer: {
		items: itemsReducer,
		orders: ordersReducer,
		bills: billsReducer,
		analytics: analyticsReducer
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: false
		})
});

// Enable refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch);

// RootState type
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch type
export type AppDispatch = typeof store.dispatch;
