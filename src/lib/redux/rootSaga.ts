import { all, fork } from 'redux-saga/effects';
import { itemsSaga } from './sagas/items.saga';
import { billsSaga } from './sagas/bills.saga';

export function* rootSaga() {
	yield all([fork(itemsSaga), fork(billsSaga)]);
}
