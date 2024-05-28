import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';
const prefix = '/hr/skill';


export const getReportSkill = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/report-v2`
    })
}

/**
 * List skill
 * @param {*} params 
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
 * List skill
 * @param {*} params 
 */
export const searchForDropdown = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/search-for-dropdown`
    })
}

/**
 * Import skill from xls file
 */
export const importSkill = (data) => {
    return formData({
        url: `${prefix}/import`,
        method: 'POST',
        data
    })
}

/**
 * Create skill
 * 
 * @param {*} data 
 */
export const create = (data) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}
export const update = (id, data) => {
    return axios({
        method: 'PUT',
        data,
        url: `${prefix}/${id}`
    })
}
export const updateCostConfig = (id, data) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/${id}`
    })
}
export const upraisePushNotify = (data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `/hr/skill-upraise/push-notify`
    })
}
export const detail = (id, data = {}) => {
    return axios({
        method: 'GET',
        data,
        url: `${prefix}/${id}`
    })
}

export const destroy = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}

export const getStaff = (id, params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/${id}/staff`
    })
}

export const getStaffSkillDetai = (id, params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/staff/${id}`
    })
}

export const getListStaffLog = (id, params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/${id}/staff/history`
    })
}

export const skillReport = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/report`
    })
}
export const apiListSkillsUpraise = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `/hr/skill-upraise`
    })
}
export const apiDetailSkillsUpraise = (id, params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `/hr/skill-upraise/${id}`
    })
}
export const apiUpdateStatusSkillsUpraise = (id, params = {}) => {
    return axios({
        method: 'PUT',
        params,
        url: `/hr/skill-upraise/${id}`
    })
}

export const apiExportSkillsUpraiseReportStaff = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `/hr/skill-upraise/report-staff`
    })
}
export const apiUpdateDetails = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `/hr/skill-upraise/act-detail`
    })
}
export default {
    getList,
    importSkill,
    create,
    update,
    detail,
    destroy,
    getStaff,
    skillReport
}