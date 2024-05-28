import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';

const prefix = '/hr/information';
const prefixV2 = '/v2/document';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}
export const getListES = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/list-es`
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
export const detail = (id, params = {}) => {
    params = {
        ...params,
        is_admin: 1
    }
    return axios({
        method: 'GET',
        params,
        url: `${prefixV2}/information/${id}`
    })
}

export const deleteCommunication = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefixV2}/delete-communication/` + id
    })
}

export const sendNotify = (id) => {
    return axios({
        method: 'GET',
        url: `${prefix}/${id}/send-notify`
    })
}

export const getStaffsByCommunication = (id) => {
    return axios({
        method: 'GET',
        url: `${prefixV2}/information/${id}/get-staffs`
    })
}

export const resetData = (id) => {
    return axios({
        method: 'PUT',
        url: `${prefix}/${id}/reset-data`
    })
}

export default {
    getList,
    create,
    detail,
    update,
    deleteCommunication
}