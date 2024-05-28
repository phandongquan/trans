import axios from '~/utils/request_hr';

const prefix = '/hr/task/taskdetaillist';
const prefix_detail = '/hr/task/logdetail';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const detail = (id, data = {}) => {
    return axios({
        method: 'GET',
        data,
        url: `${prefix_detail}/${id}`
    })
}

export default {
    getList
}