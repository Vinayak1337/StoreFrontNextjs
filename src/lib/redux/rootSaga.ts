import { all, fork } from 'redux-saga/effects';
import { itemsSaga } from './sagas/items.saga';
import { ordersSaga } from './sagas/orders.saga';
import { billsSaga } from './sagas/bills.saga';
import { analyticsSaga } from './sagas/analytics.saga';

export function* rootSaga() {
	yield all([
		fork(itemsSaga),
		fork(ordersSaga),
		fork(billsSaga),
		fork(analyticsSaga)
	]);
}
