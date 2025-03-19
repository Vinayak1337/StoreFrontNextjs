import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import itemsReducer from './slices/items.slice';
import ordersReducer from './slices/orders.slice';
import billsReducer from './slices/bills.slice';
import analyticsReducer from './slices/analytics.slice';
import userReducer from './slices/user.slice';
import settingsReducer from './slices/settings.slice';

export const store = configureStore({
	reducer: {
		user: userReducer,
		items: itemsReducer,
		orders: ordersReducer,
		bills: billsReducer,
		analytics: analyticsReducer,
		settings: settingsReducer
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
