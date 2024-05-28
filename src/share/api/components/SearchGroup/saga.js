import { 
  takeLatest, 
  call, 
  put, 
  all
} from 'redux-saga/effects'
import {
    SEARCH_GROUP
} from './actions'
import searchGroup from '~/share/api/searchGroup'
function searchAPI(keyword, limit, ids) {
    return searchGroup(keyword, limit, ids)
    .then(response => response.data)
    .catch(error => { throw error })
}

function* searchSaga(action) {
    try {
        let { keyword, limit, ids } = action

        const response = yield call(searchAPI, keyword, limit, ids)
        if(response.status){
            yield all([
                put({type: SEARCH_GROUP.SUCCESS, ...response}),
            ])
        }else{
          yield put({type: SEARCH_GROUP.ERROR, error: response})
        }
    } catch (error) {
        yield all([
            put({type: SEARCH_GROUP.ERROR, error})
        ])
    }
}

function* searchWatcher() {
    
    yield all([
        takeLatest(SEARCH_GROUP.REQUEST, searchSaga)
    ])
}

export default searchWatcher