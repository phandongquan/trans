import axios from '~/utils/request';
import axios_hr from '~/utils/request_hr';
const prefix = '/hr/staff-leave';

export const getList = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}
export const getListStaffleave = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}
export const create = (data) => {
    return axios_hr({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}
export const detail = (id, params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/${id}`
    })
}
export const createCustomType = (data) => {
    return axios_hr({
        method: 'POST',
        data,
        url: `${prefix}/custom-type`
    })
}

export const approve = (id, data) => {
    return axios_hr({
        method: 'PUT',
        data,
        url: `${prefix}/${id}/approve`
    })
}

export const reject = (id, data) => {
    return axios_hr({
        method: 'PUT',
        data,
        url: `${prefix}/${id}/reject`
    })
}

export const reimburse = (id, data) => {
    return axios_hr({
        method: 'PUT',
        data,
        url: `${prefix}/${id}/reimburse`
    })
}

export default {
    getListStaffleave,
    getList,
    create,
    createCustomType,
    detail,
    approve,
    reject,
    reimburse
}