import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { Item } from '@/types';
import { itemsAPI } from '@/lib/services/api';
import {
	fetchItemsStart,
	fetchItemsSuccess,
	fetchItemsFailure,
	fetchItemStart,
	fetchItemSuccess,
	fetchItemFailure,
	createItemStart,
	createItemSuccess,
	createItemFailure,
	updateItemStart,
	updateItemSuccess,
	updateItemFailure,
	deleteItemStart,
	deleteItemSuccess,
	deleteItemFailure
} from '../slices/items.slice';

// Worker Sagas
function* fetchItemsSaga() {
	try {
		const items: Item[] = yield call(itemsAPI.getAllItems);
		yield put(fetchItemsSuccess(items));
	} catch (error: any) {
		yield put(fetchItemsFailure(error.message || 'Failed to fetch items'));
	}
}

function* fetchItemSaga(action: PayloadAction<string>) {
	try {
		const item: Item = yield call(itemsAPI.getItemById, action.payload);
		yield put(fetchItemSuccess(item));
	} catch (error: any) {
		yield put(fetchItemFailure(error.message || 'Failed to fetch item'));
	}
}

function* createItemSaga(
	action: PayloadAction<Omit<Item, 'id' | 'createdAt'>>
) {
	try {
		const item: Item = yield call(itemsAPI.createItem, action.payload);
		yield put(createItemSuccess(item));
	} catch (error: any) {
		yield put(createItemFailure(error.message || 'Failed to create item'));
	}
}

function* updateItemSaga(
	action: PayloadAction<{ id: string; data: Partial<Item> }>
) {
	try {
		const { id, data } = action.payload;
		const item: Item = yield call(itemsAPI.updateItem, id, data);
		yield put(updateItemSuccess(item));
	} catch (error: any) {
		yield put(updateItemFailure(error.message || 'Failed to update item'));
	}
}

function* deleteItemSaga(action: PayloadAction<string>) {
	try {
		yield call(itemsAPI.deleteItem, action.payload);
		yield put(deleteItemSuccess(action.payload));
	} catch (error: any) {
		yield put(deleteItemFailure(error.message || 'Failed to delete item'));
	}
}

// Watcher Saga
export function* itemsSaga() {
	yield takeLatest(fetchItemsStart.type, fetchItemsSaga);
	yield takeLatest(fetchItemStart.type, fetchItemSaga);
	yield takeLatest(createItemStart.type, createItemSaga);
	yield takeLatest(updateItemStart.type, updateItemSaga);
	yield takeLatest(deleteItemStart.type, deleteItemSaga);
}
