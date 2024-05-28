import { all } from 'redux-saga/effects';

import authSaga from './auth';
import baseSaga from './base';


const Saga = function* () {
  yield all([
    authSaga(),
    baseSaga(),
  ])
}

export default Saga