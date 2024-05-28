import { 
  takeLatest, 
  call, 
  put, 
  all
} from 'redux-saga/effects'
import {
    SEARCH_SERVICE
} from './actions'

import searchService from '~/share/api/searchService'
function searchAPI(keyword, limit, ids) {
    return searchService(keyword, limit, ids)
    .then(response => response.data)
    .catch(error => { throw error })
}

function* searchSaga(action) {
    try {
        let { keyword, limit, ids } = action

        const response = yield call(searchAPI, keyword, limit, ids)
        if(response.status){
            yield all([
                put({type: SEARCH_SERVICE.SUCCESS, ...response}),
            ])
        }else{
          yield put({type: SEARCH_SERVICE.ERROR, error: response})
        }
    } catch (error) {
        yield all([
            put({type: SEARCH_SERVICE.ERROR, error})
        ])
    }
}

function* searchWatcher() {
    
    yield all([
        takeLatest(SEARCH_SERVICE.REQUEST, searchSaga)
    ])
}

export default searchWatcher