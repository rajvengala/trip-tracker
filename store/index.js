import { createStore, applyMiddleware } from 'redux';
import { combineReducers } from 'redux';
// import createSagaMiddleware from "redux-saga";
// import { all } from "redux-saga/effects";
// import mainSagas from "./main/sagas";
import main from './main/reducers';

// const sagaMiddleware = createSagaMiddleware();
const reducers = combineReducers({
  main,
});

// const store = createStore(reducers, applyMiddleware(sagaMiddleware));
const store = createStore(reducers);

// function* rootSaga() {
//     yield all([...mainSagas.map(saga => saga())]);
// }

export default store;
// sagaMiddleware.run(rootSaga);
