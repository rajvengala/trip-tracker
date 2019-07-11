import { all } from 'redux-saga/effects';
import mainSagas from './main/sagas';

export default function* rootSaga() {
  yield all([
    ...mainSagas.map(saga => saga()),
  ]);
}
