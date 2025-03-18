import { combineReducers } from '@reduxjs/toolkit';
import itemsReducer from './slices/items.slice';
import ordersReducer from './slices/orders.slice';
import billsReducer from './slices/bills.slice';
import analyticsReducer from './slices/analytics.slice';

export const rootReducer = combineReducers({
	items: itemsReducer,
	orders: ordersReducer,
	bills: billsReducer,
	analytics: analyticsReducer
});
