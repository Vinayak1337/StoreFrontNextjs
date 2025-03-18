import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { Order } from '@/types';
import { ordersAPI } from '@/lib/services/api';
import {
	fetchOrdersStart,
	fetchOrdersSuccess,
	fetchOrdersFailure,
	fetchOrderStart,
	fetchOrderSuccess,
	fetchOrderFailure,
	createOrderStart,
	createOrderSuccess,
	createOrderFailure,
	updateOrderStart,
	updateOrderSuccess,
	updateOrderFailure
} from '../slices/orders.slice';

// Worker Sagas
function* fetchOrdersSaga() {
	try {
		const orders: Order[] = yield call(ordersAPI.getAllOrders);
		yield put(fetchOrdersSuccess(orders));
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to fetch orders';
		yield put(fetchOrdersFailure(errorMessage));
	}
}

function* fetchOrderSaga(action: PayloadAction<string>) {
	try {
		const order: Order = yield call(ordersAPI.getOrderById, action.payload);
		yield put(fetchOrderSuccess(order));
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to fetch order';
		yield put(fetchOrderFailure(errorMessage));
	}
}

function* createOrderSaga(
	action: PayloadAction<Omit<Order, 'id' | 'createdAt'>>
) {
	try {
		const order: Order = yield call(ordersAPI.createOrder, action.payload);
		yield put(createOrderSuccess(order));
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to create order';
		yield put(createOrderFailure(errorMessage));
	}
}

function* updateOrderSaga(
	action: PayloadAction<{ id: string; data: Partial<Order> }>
) {
	try {
		const { id, data } = action.payload;
		const order: Order = yield call(ordersAPI.updateOrder, id, data);
		yield put(updateOrderSuccess(order));
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to update order';
		yield put(updateOrderFailure(errorMessage));
	}
}

// Watcher Saga
export function* ordersSaga() {
	yield takeLatest(fetchOrdersStart.type, fetchOrdersSaga);
	yield takeLatest(fetchOrderStart.type, fetchOrderSaga);
	yield takeLatest(createOrderStart.type, createOrderSaga);
	yield takeLatest(updateOrderStart.type, updateOrderSaga);
}
