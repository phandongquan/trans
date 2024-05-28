import axios from '~/utils/request_hr';
import formData_hr from '~/utils/formData_hr';
const prefix = '/hr/task-daily/workflow-step';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}

export const detail = (id = 0) => {
    return axios({
        method: 'GET',
        url: `${prefix}/${id}`
    })
}

export const insert = (data = {}) => {
    return formData_hr({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}

export const update = (id = 0, data = {}) => {
    return formData_hr({
        method: 'POST',
        data,
        url: `${prefix}/${id}`
    })
}

export const destroy = (id = 0) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}

export const updatePriority = (data = {}) => {
    return axios({
        method: 'PUT',
        data,
        url: `${prefix}/update-priority`
    })
}