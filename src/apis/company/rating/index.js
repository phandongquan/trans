import axios from '~/utils/request_hr';
const prefix = '/hr/rating';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}
export const update = (id, data) => {
    return axios({
        method: 'PUT',
        data,
        url: `${prefix}/${id}`
    })
}
export const detail = (id, data = {}) => {
    return axios({
        method: 'GET',
        data,
        url: `${prefix}/${id}`
    })
}

export const destroy = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}

export default {
    getList,
    update,
    detail,
    destroy,
}