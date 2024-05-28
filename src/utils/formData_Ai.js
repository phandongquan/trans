import axios, { CancelToken } from 'axios';
import Cookies from 'js-cookie';
import { CANCEL } from 'redux-saga'

import { URL_AI_HR } from '~/constants';
// const token = Cookies.get('ws_token');
const token = localStorage.getItem('client_hasaki_inside_token');

export default (options) => {
    const source = CancelToken.source();
    const promise = new Promise((resolve, reject) => {
        axios({
            ...options,
            url: `${URL_AI_HR}${options.url}`,
            headers: {
                // 'Authorization': `Bearer ${token}`,
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