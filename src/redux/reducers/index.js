import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { reducer as formReducer } from 'redux-form';
import ui from '~/redux/reducers/layout';
import auth from '~/redux/reducers/auth';
import base from '~/redux/reducers/base';
export default (history) => combineReducers({
  form: formReducer,
  router: connectRouter(history),
  ui,
  auth,
  baseData: base
})
