import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import './services/locale/setup';

import * as serviceWorker from './serviceWorker';

import 'antd/dist/reset.css';
import './assets/css/index.scss';
import 'react-image-lightbox/style.css'
import 'react-quill/dist/quill.snow.css';

import store from '~/redux/store';
import history from '~/redux/history';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(duration).extend(timezone).extend(utc).extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs().tz('Asia/Ho_Chi_Minh');

ReactDOM.render(
  <Provider store={store}>
    <App history={history} />
  </Provider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
