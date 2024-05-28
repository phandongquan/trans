import axios from '~/utils/request_hr';
const prefix = '/hr/task-daily';

export const getVerticalColumnReport = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/vertical-column-report`
    })
}

export const updateValid = (data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/update-is-valid`
    })
}
export const updateValid2 = (data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/update-is-valid2`
    })
}
export const apiListVerify = (params = {}) =>{
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/list-verify`
    })
}
export const getDetailVerify = (id, params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/list-verify/${id}`
    })
}
export const apiListReport = (params = {}) =>{
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/report-verify`
    })
}
export const apiListReportStaff = (params = {}) =>{
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/report-verify-staff`
    })
}
export const searchForDropDownTask = (params = {}) =>{
    return axios({
        method: 'GET',
        params,
        url: `/hr/task/search-for-dropdown`
    })
}
 