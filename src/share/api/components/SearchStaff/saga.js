import { 
  takeLatest, 
  call, 
  put, 
  all
} from 'redux-saga/effects'
import {
    SEARCH_STAFF
} from './actions'

import searchStaff from '~/share/api/searchStaff'
function searchAPI(keyword, limit, ids) {
    return searchStaff(keyword, limit, ids)
    .then(response => response.data)
    .catch(error => { throw error })
}

function* searchSaga(action) {
    try {
        let { keyword, limit, ids } = action

        const response = yield call(searchAPI, keyword, limit, ids)
        if(response.status){
            yield all([
                put({type: SEARCH_STAFF.SUCCESS, ...response}),
            ])
        }else{
          yield put({type: SEARCH_STAFF.ERROR, error: response})
        }
    } catch (error) {
        yield all([
            put({type: SEARCH_STAFF.ERROR, error})
        ])
    }
}

function* searchWatcher() {
    
    yield all([
        takeLatest(SEARCH_STAFF.REQUEST, searchSaga)
    ])
}

export default searchWatcher