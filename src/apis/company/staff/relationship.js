import axios_hr from '~/utils/request_hr';

const prefix = '/hr/staff';

/**
 * List relation by staffId
 * @param {*} staffId 
 * @param {*} params 
 */
export const getByStaff = (staffId, params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/${staffId}/relationship`
    })
}

/**
 * Create relationship
 * @param {Interger} staffId 
 * @param {Object} data 
 */
export const create = (data = {}) => {
    return axios_hr({
        method: 'POST',
        data,
        url: `${prefix}/relationship`
    })
}

/**
 * Update relationship
 * @param {Interger} staffId 
 * @param {Object} data 
 */
export const update = (id, data = {}) => {
    return axios_hr({
        method: 'PUT',
        data,
        url: `${prefix}/relationship/${id}`
    })
}

export const destroy = (id) => {
    return axios_hr({
        method: 'DELETE',
        url: `${prefix}/relationship/${id}`
    })
}

export default {
    getByStaff,
    create,
    update,
    destroy
}