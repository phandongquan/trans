import axios from '~/utils/request_hr';
import formData from '~/utils/formData';

const prefix = '/hr/location';
/**
 * Get list
 * @param {*} params 
 */
 export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}
export const getConfig = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/configs`
    })
}

 export const saveConfig = (data) => {
    return formData({
        url: `${prefix}/configs`, 
        method: 'POST',        
        data
    })
}
export const saveDefaultConfig = (data) => {
    return formData({
        url: `${prefix}/configs-save-default`, 
        method: 'POST',        
        data
    })
}
