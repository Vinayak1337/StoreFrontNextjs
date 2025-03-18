import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus } from '@/types';
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
	updateOrderStatusStart,
	updateOrderStatusSuccess,
	updateOrderStatusFailure
} from '../slices/orders.slice';

// Worker Sagas
function* fetchOrdersSaga() {
	try {
		const orders: Order[] = yield call(ordersAPI.getAllOrders);
		yield put(fetchOrdersSuccess(orders));
	} catch (error: any) {
		yield put(fetchOrdersFailure(error.message || 'Failed to fetch orders'));
	}
}

function* fetchOrderSaga(action: PayloadAction<string>) {
	try {
		const order: Order = yield call(ordersAPI.getOrderById, action.payload);
		yield put(fetchOrderSuccess(order));
	} catch (error: any) {
		yield put(fetchOrderFailure(error.message || 'Failed to fetch order'));
	}
}

function* createOrderSaga(
	action: PayloadAction<Omit<Order, 'id' | 'createdAt'>>
) {
	try {
		const order: Order = yield call(ordersAPI.createOrder, action.payload);
		yield put(createOrderSuccess(order));
	} catch (error: any) {
		yield put(createOrderFailure(error.message || 'Failed to create order'));
	}
}

function* updateOrderStatusSaga(
	action: PayloadAction<{ id: string; status: OrderStatus }>
) {
	try {
		const { id, status } = action.payload;
		const order: Order = yield call(ordersAPI.updateOrderStatus, id, status);
		yield put(updateOrderStatusSuccess(order));
	} catch (error: any) {
		yield put(
			updateOrderStatusFailure(error.message || 'Failed to update order status')
		);
	}
}

// Watcher Saga
export function* ordersSaga() {
	yield takeLatest(fetchOrdersStart.type, fetchOrdersSaga);
	yield takeLatest(fetchOrderStart.type, fetchOrderSaga);
	yield takeLatest(createOrderStart.type, createOrderSaga);
	yield takeLatest(updateOrderStatusStart.type, updateOrderStatusSaga);
}
