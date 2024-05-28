import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';

const prefix = '/hr/staff';

/**
 * List skill by staffId
 * 
 * @param {*} staffId 
 * @param {*} params 
 */
export const getByStaff = (staffId, params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/${staffId}/skill`
    })
}

/**
 * Create Staffskill
 * @param {Interger} staffId 
 * @param {Object} data 
 */
export const create = (data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/skill`
    })
}

/**
 * Update Staffskill
 * @param {Interger} staffId 
 * @param {Object} data 
 */
export const update = (id, data = {}) => {
    return axios({
        method: 'PUT',
        data,
        url: `${prefix}/${id}/skill`
    })
}

/**
 * Update Staffskill level
 * @param {Object} data 
 */
export const updateLevel = (data = {}) => {
    return axios({
        method: 'PUT',
        data,
        url: `${prefix}/skill/update-level`
    })
}

/**
 * Delete Staffskill
 * @param {*} id 
 */
export const destroy = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/${id}/skill`
    })
}

/**
 * Delete Staffskill
 * @param {*} id 
 */
export const massDestroy = (data) => {
    return axios({
        method: 'DELETE',
        data,
        url: `${prefix}/skill`
    })
}

/**
 * Export staff skill
 * 
 * @param {*} staffId 
 * @param {*} params 
 */
 export const exportStaffSkill = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/skill/export`
    })
}

/**
 * List skill by staffId
 * 
 * @param {*} staffId 
 * @param {*} params 
 */
 export const importStaffSkill = (data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/skill/import`
    })
}

export default {
    getByStaff,
    create,
    update,
    updateLevel,
    destroy,
    massDestroy,
    exportStaffSkill,
    importStaffSkill,
}