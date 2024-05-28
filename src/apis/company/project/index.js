import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';
const prefix = '/hr/projects';

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
export const detail = (id, data = {}) => {
    return axios({
        method: 'GET',
        data,
        url: `${prefix}/${id}`
    })
}

export const getMyTasks = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/mytasks`
    })
}

export const getReport = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/report`
    })
}

export const getReportStaff = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/report-staff`
    })
}

export const updateConfig = (id, data) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/${id}/update-config`
    })
}

export const getListTaskSuggest = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/suggest`
    })
}
export const deleteTaskSuggest = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/suggest/` + id
    })
}
export const createTaskSuggest = (data) =>{
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/suggest`
    })
}
export const updateTaskSuggest = (id, data) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/suggest/${id}`
    })
}
export const detailTaskSuggest = (id, data = {}) => {
    return axios({
        method: 'GET',
        data,
        url: `${prefix}/suggest/${id}`
    })
}
export const importProjectTaskSuggest = (data) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/import-task-suggest`
    })
}
/**
 * Get aggregations
 * @param {*} params 
 * @returns 
 */
export const suggestName = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/suggest-name`
    })
}

export default {
    getList,
    create,
    detail,
    update,
}