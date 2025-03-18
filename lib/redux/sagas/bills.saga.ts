import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { Bill } from '@/types';
import { billsAPI } from '@/lib/services/api';
import {
	fetchBillsStart,
	fetchBillsSuccess,
	fetchBillsFailure,
	fetchBillStart,
	fetchBillSuccess,
	fetchBillFailure,
	createBillStart,
	createBillSuccess,
	createBillFailure,
	updateBillStart,
	updateBillSuccess,
	updateBillFailure,
	deleteBillStart,
	deleteBillSuccess,
	deleteBillFailure
} from '../slices/bills.slice';

// Worker Sagas
function* fetchBillsSaga() {
	try {
		const bills: Bill[] = yield call(billsAPI.getAllBills);
		yield put(fetchBillsSuccess(bills));
	} catch (error: any) {
		yield put(fetchBillsFailure(error.message || 'Failed to fetch bills'));
	}
}

function* fetchBillSaga(action: PayloadAction<string>) {
	try {
		const bill: Bill = yield call(billsAPI.getBillById, action.payload);
		yield put(fetchBillSuccess(bill));
	} catch (error: any) {
		yield put(fetchBillFailure(error.message || 'Failed to fetch bill'));
	}
}

function* createBillSaga(action: PayloadAction<Partial<Bill>>) {
	try {
		const bill: Bill = yield call(billsAPI.createBill, action.payload);
		yield put(createBillSuccess(bill));
	} catch (error: any) {
		yield put(createBillFailure(error.message || 'Failed to create bill'));
	}
}

function* updateBillSaga(
	action: PayloadAction<{ id: string; data: Partial<Bill> }>
) {
	try {
		const { id, data } = action.payload;
		const bill: Bill = yield call(billsAPI.updateBill, id, data);
		yield put(updateBillSuccess(bill));
	} catch (error: any) {
		yield put(updateBillFailure(error.message || 'Failed to update bill'));
	}
}

function* deleteBillSaga(action: PayloadAction<string>) {
	try {
		yield call(billsAPI.deleteBill, action.payload);
		yield put(deleteBillSuccess(action.payload));
	} catch (error: any) {
		yield put(deleteBillFailure(error.message || 'Failed to delete bill'));
	}
}

// Watcher Saga
export function* billsSaga() {
	yield takeLatest(fetchBillsStart.type, fetchBillsSaga);
	yield takeLatest(fetchBillStart.type, fetchBillSaga);
	yield takeLatest(createBillStart.type, createBillSaga);
	yield takeLatest(updateBillStart.type, updateBillSaga);
	yield takeLatest(deleteBillStart.type, deleteBillSaga);
}
