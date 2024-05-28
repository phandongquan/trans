import axios from '~/utils/request_hr';
const prefix = '/hr/task-daily/workflow';

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
    return axios({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}

export const update = (id = 0, data = {}) => {
    return axios({
        method: 'PUT',
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
export const apiDuplicateTask = (id) => {
    return axios({
        method: 'POST',
        url: `${prefix}/duplicate/${id}`
    })
}