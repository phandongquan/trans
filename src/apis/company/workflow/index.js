import axios from '~/utils/request_hr';

const prefix = '/hr/workflows';

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

export const duplicate = (id) => {
    return axios({
        method: 'POST',
        url: `${prefix}/duplicate/${id}`
    })
}

export const reportWorkflowTasks = (params = {}) => {
    return axios({
        method: 'GET',
        params: params,
        url: `${prefix}/report-workflow-tasks`
    })
}

export default {
    getList,
    create,
    update,
    detail,
    destroy,
    reportWorkflowTasks
}