import axios_hr from '~/utils/request_hr';
import formData_hr from '~/utils/formData_hr';
const prefix = '/hr/asset-device/part'

export const list = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}

export const detail = (id, data = {}) => {
    return axios_hr({
        method: 'GET',
        data,
        url: `${prefix}/${id}`
    })
}

export const save = (id, data = {}) => {
    return formData_hr({
        method: 'POST',
        data,
        url: `${prefix}/${id}`
    })
}

export const destroy = (id, params = {}) => {
    return axios_hr({
        method: 'DELETE',
        params,
        url: `${prefix}/${id}`
    })
}