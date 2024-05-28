import axios from '~/utils/request_hr';

const prefix = '/hr/staff/skill-log';

/**
 * Get list staff skill log
 * @param {*} params 
 * @returns 
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

/**
 * Get list staff skill log
 * @param {*} params 
 * @returns 
 */
 export const statistical = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}-statistical`
    })
}