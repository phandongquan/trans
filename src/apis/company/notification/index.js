import axios from '~/utils/request';

export const sendNotify = (params = {}) => {
    return axios({
        method: 'POST',
        params,
        url: 'setting/notification'
    })
}