import formData from '~/utils/formData';
import axios_hr from '~/utils/request_hr';
const prefix = '/hr/staff/external-account';

export const getList = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}

export const getListDetailStaff = (id) => {
    return axios_hr({
        method: 'GET',
        url: `/hr/staff/${id}/external-account`
    })
}

export const detail = (id) => {
    return axios_hr({
        method: 'GET',
        url: `${prefix}/${id}`
    })
}
export const destroy = (id) => {
    return axios_hr({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}
export const create = (data = {}) => {
    return axios_hr({
        method: 'POST',
        data,
        url: `${prefix}/save`
    })
}
export const update = (data) => {
    return axios_hr({
        method: 'PUT',
        data,
        url: `${prefix}/save`
    })
}