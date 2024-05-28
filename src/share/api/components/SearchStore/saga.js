import { 
  takeLatest, 
  call, 
  put, 
  all
} from 'redux-saga/effects'
import {
    SEARCH_STORE
} from './actions'
import { search } from '~/apis/setting/store'

function* searchSaga(action) {
    try {
        let { keyword, limit, ids } = action

        const response = yield call(search, keyword, limit, ids)
        if(response.status === 1){
            yield all([
                put({type: SEARCH_STORE.SUCCESS, ...response}),
            ])
        }else{
          yield put({type: SEARCH_STORE.ERROR, error: response})
        }
    } catch (error) {
        yield all([
            put({type: SEARCH_STORE.ERROR, error})
        ])
    }
}

function* searchWatcher() {
    
    yield all([
        takeLatest(SEARCH_STORE.REQUEST, searchSaga)
    ])
}

export default searchWatcher