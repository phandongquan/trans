import axios from '~/utils/request_hr';

const prefix = '/hr/projects';

/**
 * Get list project tast
 * @param {*} projectId 
 * @param {*} params 
 */
export const getList = (projectId, params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/${projectId}/tasks`
    })
}

/**
 * Insert - update project task
 */
export const save = (projectId, id = 0, data) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/${projectId}/task/${id}`
    })
}

/**
 * Get project task detail
 * 
 * @param {*} projectId 
 * @param {*} id 
 * @param {*} data 
 */
export const detail = (projectId, id, data = {}) => {
    return axios({
        method: 'GET',
        data,
        url: `${prefix}/${projectId}/task/${id}`
    })
}

/**
 * Delete project task
 * 
 * @param {*} projectId  
 * @param {*} id 
 */
export const destroy = (projectId, id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/${projectId}/task/${id}`
    })
}

/**
 * List comment project task
 * 
 * @param {*} params 
 */
export const getComment = (params) => {
    let toParams = new URLSearchParams(params).toString();
    return axios({
        method: 'GET',
        url: `/hr/comment-v1?${toParams}`
    })
}
/**
 * Add comment to project task
 * 
 * @param {*} data 
 */
export const addComment = (data) => {
    return axios({
        method: 'POST',
        data,
        url: `/hr/comment-v1`
    })
}
export default {
    getList,
    save,
    detail,
    destroy,
    getComment,
    addComment
}