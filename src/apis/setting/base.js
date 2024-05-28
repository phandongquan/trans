import axios from '~/utils/request_hr'

const prefix = '/hr/staff/base-data';

export const getData = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params,
        },
        url: `${prefix}`
    })
}

export default {
    getData
}
