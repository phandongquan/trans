import axios from '~/utils/request_tuyendung';
import formData from '~/utils/formData_tuyendung';

const prefix = '/members';

/**
 * Get list members
 * @param {*} params 
 */
export const getListMembers = ( params = {} ) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const detail = ( id, params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/${id}`
    })
}

export const create = (data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}

export const update = ( id, data = {} ) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/${id}`
    })
}

export const upload = (data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/upload`
    })
}

export default {
    getListMembers,
}