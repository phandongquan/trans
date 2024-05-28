import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';
const prefix = '/hr/ai-log-issue';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
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
export const deleteLog = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/` + id
    })
}
export const detail = (id, data = {}) => {
    return axios({
        method: 'GET',
        data,
        url: `${prefix}/${id}`
    })
}

export const deleteMul = (data) => {
    return axios({
        method: 'DELETE',
        data,
        url: `${prefix}/del-mul`
    })
}