import { 
    takeLatest, 
    call, 
    put, 
    all,
  } from 'redux-saga/effects'
  import {
    actionType as TYPE
} from './actions'
import { getListObject, getListLink } from '~/apis/setting/upload'
  
function* getListSaga(action) {
    try {
        let { params: { code, object_id, object_type, keyby_objid } } = action
        let response = {}
        let links = []
        if(code){
            response = yield call(getListObject, {
                code
            })
            if(response.status){
                links = response.data.upload_links
            }
        }else if(object_id && object_type){
            response = yield call(getListLink, {
                object_id,
                object_key: object_type
            })
            if(response.status){
                links = response.data
            }
        }
        let files = {}
        if(keyby_objid){
            for (let index = 0; index < links.length; index++) {
                const element = links[index];
                if(keyby_objid === 1){
                    files[element.object_id] = element
                }else if(keyby_objid === 2){
                    files[element.object_id] = [...files[element.object_id] || [], element]
                }
            }
            files = Object.values(files)
        }else{
            files = links
        }
        if(response.status){
            yield all([
                put({type: TYPE.SUCCESS, links}),
            ])
        }else{
            yield put({type: TYPE.ERROR, error: response})
        }
    } catch (error) {
        yield all([
            put({type: TYPE.ERROR, error})
        ])
    }
}
  
  function* getListWatcher() {
      
      yield all([
          takeLatest(TYPE.REQUEST, getListSaga),
      ])
  }
  
  export default getListWatcher