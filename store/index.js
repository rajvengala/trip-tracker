import { createStore, applyMiddleware } from 'redux';
import { combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import main from './main/reducers';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();
const reducers = combineReducers({
  main,
});

const store = createStore(reducers, applyMiddleware(sagaMiddleware));

export default store;
sagaMiddleware.run(rootSaga);
