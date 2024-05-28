import axios from '~/utils/request_hr';
const prefix = '/hr/ai-order';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/logs`
    })
}

export const destroy = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/log/${id}`
    })
}