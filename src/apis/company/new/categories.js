import axios from '~/utils/request_tuyendung';
import formData from '~/utils/formData_tuyendung';

const prefix = '/news/category';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: '/news/categories'
    })
}
export const create = (data) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}
export const update = (id, data) => {
    return formData({
        method: 'POST',
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
    create,
    detail,
    update,
    destroy
}