import {
  takeEvery,
  put,
  call,
} from 'redux-saga/effects';
import * as types from './types';


function* saveTripData(action) {
  const {db, tripId, tripData} = action;
  const colVals = [tripId, JSON.stringify(tripData)];
  let stmtFailed = false, transFailed = false;
  let errMsg = {
    transErr: '',
    stmtErr: '',
  };

  const runStmt = tx => {
    tx.executeSql(
      'insert into trip_tracker (id, tripData) values (?, ?)',
      colVals,
      (tx, rs) => {
      },
      (tx, err) => {
        stmtFailed = true;
        errMsg.stmtErr = err.toString();
      });
  };

  const runTrans = () => {
    db.transaction(runStmt, (err) => {
      transFailed = true;
      errMsg.transErr = err.toString();
    }, () => {
    });
  };

  yield call(runTrans, []);
  yield put({
    type: types.SAVE_TRIP_DATA_END,
    errMsg,
  });
}

function* saveTripDataSaga() {
  yield takeEvery(types.SAVE_TRIP_DATA_START, saveTripData);
}

const mainSagas = [
  saveTripDataSaga,
];

export default mainSagas;
