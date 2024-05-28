import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';

const prefix = '/hr/staff';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/history`
    })
}

/**
 * List relation by staffId
 * @param {*} staffId 
 * @param {*} params 
 */
export const getByStaff = (staffId, params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/${staffId}/history`
    })
}

/**
 * Insert - Update history
 * @param {Interger} staffId 
 * @param {Object} data 
 */
export const save = (data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/history/save`
    })
}

export const destroy = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/history/${id}`
    })
}
export const getDetailStaffHistory = (id) => {
    return axios({
        method: 'GET',
        url: `${prefix}/history/${id}`
    })
}

export default {
    getByStaff,
    save,
    destroy
}