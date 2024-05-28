import axios from '~/utils/request_hr';

const prefix = '/hr/task';

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

export const reportInMonth = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/report-in-month`
    })
}


export default {
    getList,
    create,
    update,
    detail,
    destroy
}