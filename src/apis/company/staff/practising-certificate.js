import axios_hr from '~/utils/request_hr';

const prefix = '/hr/staff';

/**
 * List practising certificate by staffId
 * @param {*} staffId 
 * @param {*} params 
 */
export const getByStaff = (staffId, params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/${staffId}/practising-certificate`
    })
}

/**
 * Create practising certificate
 * @param {Interger} staffId 
 * @param {Object} data 
 */
export const create = (data = {}) => {
    return axios_hr({
        method: 'POST',
        data,
        url: `${prefix}/practising-certificate`
    })
}

/**
 * Update practising certificate
 * @param {Interger} staffId 
 * @param {Object} data 
 */
export const update = (id, data = {}) => {
    return axios_hr({
        method: 'PUT',
        data,
        url: `${prefix}/practising-certificate/${id}`
    })
}

/**
 * Delete practising certificate
 * @param {*} id 
 */
export const destroy = (id) => {
    return axios_hr({
        method: 'DELETE',
        url: `${prefix}/practising-certificate/${id}`
    })
}

export default {
    getByStaff,
    create,
    update,
    destroy
}