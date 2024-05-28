import axios from '~/utils/request_hr';

const prefix = '/hr/projects';

/**
 * Get list tasks input
 * @param {*} params 
 */
export const getListTasksInputAdmin = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/list-task-input-admin`
    })
}

/**
 * Insert or Update
 * @param {*} params 
 */
 export const save = (data = {}, id =0) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/upsert-task-input/${id}`
    })
}

/**
 * Detail task input
 * @param {*} id 
 */
export const detail = (id = 0) => {
    return axios({
        method: 'GET',
        url: `${prefix}/task-input/${id}`
    })
}