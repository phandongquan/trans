import { put, takeEvery } from 'redux-saga/effects'

import { notification, Modal } from 'antd';
function* alertWatcher(){
  yield takeEvery('*', function* logger({response, error,...props}) {
    if( response ){
      if( response.status && response.message){
        notification['success']({
          message: response.message,
        });
      }else if( !response.status && response.message){// if(response.code === 401){
        yield put({type: 'SHARE.ALERT.ERROR', data_response: response})
        notification['error']({
          message: response.message,
        });
      }
    }else if(error){
      yield put({type: 'SHARE.ALERT.ERROR', data_error: error})
      if(error.message){
        if(error?.type === 'modal'){
          Modal.error({
            title: error.message
          });
        }else{
          notification['error']({
            message: error.message,
          });
        }
      }
    }
  })
}

export default alertWatcher