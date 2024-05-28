import axios, { CancelToken } from 'axios';
import Cookies from 'js-cookie';
import { CANCEL } from 'redux-saga'

import { WS_TUYENDUNG } from '~/constants';
// const token = Cookies.get('ws_token');
const token = localStorage.getItem('client_hasaki_inside_token');

export default (options) => {
    const source = CancelToken.source();
    const promise = new Promise((resolve, reject) => {
        axios({
            ...options,
            url: `${WS_TUYENDUNG}${options.url}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
            cancelToken: source.token
        })
            .then(response => resolve(response.data))
            .catch(error => { throw error })
    })
    promise[CANCEL] = () => source.cancel();
    return promise;
}