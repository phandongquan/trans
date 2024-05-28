import axios from '~/utils/request';
import formData from '~/utils/formData';
import axios_hr from '~/utils/request_hr';
const prefix = '/hr/staff';

export const getList = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}
/**
 * Import staff from xls file
 */
export const importStaff = (data) => {
    return formData({
        url: `${prefix}/import`, 
        method: 'POST',        
        data
    })
}
/**
 * Create staff
 * 
 * @param {*} staff 
 */
export const create = (data) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}
export const update = (id, data) => {
    return axios_hr({
        method: 'PUT',
        data,
        url: `${prefix}/${id}`
    })
}
export const detail = (id, data = {}) => {
    return axios_hr({
        method: 'GET',
        data,
        url: `${prefix}/${id}`
    })
}
export const getByParam = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/by-param`
    })
}

export const destroy = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}

export const getLastExam = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/last-exam`
    })
}

export const clearUp = (id, params = {}) => {
    return axios_hr({
        method: 'DELETE',
        params: {
            ...params
        },
        url: `${prefix}/${id}/reset-device`
    })
}
export const resetPass = (params = {}) => {
    //{{APP_URL}}/api/mobile/staff/change-password
    return axios_hr({
        method: 'POST',
        params: {
            ...params
        },
        url: `/mobile/staff/change-password`
    })
}

export const saveArea = (params = {}, staffId = 0) =>{
    return axios_hr({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/location-manage/${staffId}`
    })
}
export const updateArea = (id= 0 , params = {}) =>{
    return axios_hr({
        method: 'PUT',
        params: {
            ...params
        },
        url: `${prefix}/location-manage/${id}`
    })
}
export const getDetailArea = (params = {}) =>{
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/location-manage`
    })
}
export const getViewLog = (params = {}) =>{
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `/news/activity-log`
    })
}

export const getPerformanceStaff = (id, params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/${id}/performance`
    })
}

export const staffBalance = (staffId, params = {}) =>{
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/${staffId}/balance`
    })
}

export default {
    getList,
    importStaff,
    create,
    update,
    detail,
    getByParam,
    destroy,
    getLastExam,
    getDetailArea,
    updateArea,
    getPerformanceStaff, 
    staffBalance
}