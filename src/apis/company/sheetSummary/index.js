import axios from '~/utils/request_hr';
import formData_hr from '~/utils/formData_hr';

const prefix = '/hr/sheet-summary';


export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        timeout: 1500000,
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const getDetail = (id, params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/skill-revenue-detail/${id}`
    })
}

export const skillBonusReport = (params = {}) => {
    return axios({
        method: 'GET',
        timeout: 1500000,
        params: {
            ...params
        },
        url: `${prefix}/skill-bonus-report`
    })
}

export const skillBonusReportExport = (params = {}) => {
    return axios({
        method: 'GET',
        timeout: 1500000,
        params: {
            ...params
        },
        url: `/hr/skill/bonus`
    })
}

export const percentDifference = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/percent-difference`
    })
}

export const importSheetSummary = (data = {}) => {
    return formData_hr({
        method: 'POST',
        data,
        url: `${prefix}/import`
    })
}