import { 
  takeLatest, 
  call, 
  put, 
  all
} from 'redux-saga/effects'
import {
    SEARCH_USER
} from './actions'
import { search } from '~/apis/setting/user'

function* searchSaga(action) {
    try {
        let { params } = action

        const response = yield call(search, params)
        if(response.status){
            yield all([
                put({type: SEARCH_USER.SUCCESS, ...response}),
            ])
        }else{
          yield put({type: SEARCH_USER.ERROR, error: response})
        }
    } catch (error) {
        yield all([
            put({type: SEARCH_USER.ERROR, error})
        ])
    }
}

function* searchWatcher() {
    
    yield all([
        takeLatest(SEARCH_USER.REQUEST, searchSaga)
    ])
}

export default searchWatcher