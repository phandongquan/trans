import axios from '~/utils/request_hr';
const prefix = '/hr/projects/task-schedule';

/**
 * List task schedule
 * @param {*} params 
 */
export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

// export const getListExport = (params = {}) => {
//     return axios({
//         method: 'GET',
//         params: {
//             ...params
//         },
//         url: `${prefix}/export`
//     })
// }
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

export const detail = (id, params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params,
        },
        url: `${prefix}/${id}`
    })
}

export const deleteTask = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/` + id
    })
}