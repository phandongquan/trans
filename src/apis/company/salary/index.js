import axios_hr from '~/utils/request_hr';
const prefix = '/hr/salary';

/**
 * export data
 * @param {*} params 
 */
export const exportData = (params = {}) => {
    return axios_hr({
        method: 'POST',
        timeout: 500000,
        params: {
            ...params
        },
        url: `${prefix}/export`
    })
}

/**
 * Get salary config staff
 * @param {*} id 
 * @param {*} params 
 * @returns 
 */
 export const getSalaryConfigByConditions = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params,
        url: `${prefix}/staffconfig/list-by-conditions`
    })
}

/**
 * Get salary config staff
 * @param {*} id 
 * @param {*} params 
 * @returns 
 */
export const getStaffConfig = (id, params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/staffconfig/${id}`
    })
}

/**
 * Update salary config staff
 * @param {*} id 
 * @param {*} data 
 * @returns 
 */
export const updateStaffConfig = (id, data = {}) => {
    return axios_hr({
        method: 'POST',
        data,
        url: `${prefix}/staffconfig/${id}`
    })
}

export default {
    exportData
}