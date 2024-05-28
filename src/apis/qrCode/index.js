import formData_hr from '~/utils/formData_hr';
import axios from '~/utils/request_hr';
const prefix = '/hr/qr-mapping';
export const generate = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/generate`
    })
}
export const getListType = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/0`
    })
}
export const create = (data = {}) => { 
    return formData_hr({
        method: 'POST',
        data ,
        url: `${prefix}`
    })
}
export const update = (id,data = {}) => { 
    return formData_hr({
        method: 'POST',
        data ,
        url: `${prefix}/${id}`
    })
}
export const getListQR = (params = {}) => { 
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}
export const detail = (id) => {
    return axios({
        method: 'GET',
        url: `${prefix}/${id}`
    })
}
export const apiLogQR = (params = {}) =>{
    return axios({
        method: 'GET',
        params,
        url: `/news/activity-log`
    })
}
export const apiLogDevice = (params = {}) =>{
    return axios({
        method: 'GET',
        params,
        url: `/hr/asset-device/criterions/log`
    })
}