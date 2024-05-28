import axios from '~/utils/request_hr';

const prefix = '/hr/task/report';

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