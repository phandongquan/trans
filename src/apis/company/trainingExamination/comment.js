import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr'

const prefix = '/news/comments';
/**
 * Get comment staff
 * 
 * @param {*} id 
 * @param {*} params 
 */
 export const getListComment = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}


export const createComment = (data) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}
