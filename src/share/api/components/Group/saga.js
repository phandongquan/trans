import { 
  takeLatest, 
  call, 
  put, 
  all
} from 'redux-saga/effects'
import {
    actionType as TYPE
} from './actions'

import getListStore from '~/share/api/getListStore'

function* getListSaga(action) {
    try {
        let { params } = action

        const response = yield call(getListStore, params)
        if(response.status){
            yield all([
                put({type: TYPE.LIST.SUCCESS, ...response}),
            ])
        }else{
          yield put({type: TYPE.LIST.ERROR, error: response})
        }
    } catch (error) {
        yield all([
            put({type: TYPE.LIST.ERROR, error})
        ])
    }
}

function* getListWatcher() {
    
    yield all([
        takeLatest(TYPE.LIST.REQUEST, getListSaga)
    ])
}

export default getListWatcher