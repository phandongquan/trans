import axios_hr from '~/utils/request_hr';
import formData_hr from '~/utils/formData_hr';

const prefix = '/hr/staff';

/**
 * List specialized by staffId
 * @param {*} staffId 
 * @param {*} params 
 */
export const getByStaff = (staffId, params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/${staffId}/specialized`
    })
}

/**
 * Create specialized
 * @param {Interger} staffId 
 * @param {Object} data 
 */
export const create = (data = {}) => {
    return formData_hr({
        method: 'POST',
        data,
        url: `${prefix}/specialized`
    })
}

/**
 * Update specialized
 * @param {Interger} staffId 
 * @param {Object} data 
 */
export const update = (id, data = {}) => {
    return formData_hr({
        method: 'POST',
        data,
        url: `${prefix}/specialized/${id}`
    })
}

/**
 * Delete specialized
 * @param {*} id 
 */
export const destroy = (id) => {
    return axios_hr({
        method: 'DELETE',
        url: `${prefix}/specialized/${id}`
    })
}
export const verify = (id) => {
    return axios_hr({
        method: 'PUT',
        url: `${prefix}/specialized/approve/${id}`
    })
}
export default {
    getByStaff,
    create,
    update,
    destroy
}