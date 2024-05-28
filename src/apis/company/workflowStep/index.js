import formData_hr from '~/utils/formData_hr';
import axios from '~/utils/request_hr';

const prefix = '/hr/workflows/steps';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}
/**
 * create skill
 * 
 * @param {*} data 
 */
export const create = (data) => {
    return axios({
        method: 'POST',
        data,
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
export const createFormData = (data={}) => {
    return formData_hr({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}
export const updateFormData = (id, data={}) => {
    return formData_hr({
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

export const getListCondition = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/conditions`
    })
}

export const updatePriority = (data = {}) => {
    return axios({
        method: 'PUT',
        data,
        url: `${prefix}/update-priority`
    })
}

export default {
    getList,
    create,
    update,
    detail,
    destroy
}