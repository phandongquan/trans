import axios from '~/utils/request_tuyendung';

const prefix = '/basic';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export default {
    getList
}