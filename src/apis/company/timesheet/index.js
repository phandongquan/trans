import axios from '~/utils/request';
import axios_hr from '~/utils/request_hr';
import formData from '~/utils/formData';
import formData_hr from '~/utils/formData_hr';
const prefix = '/hr/timesheet';

export const getList = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const getTimesheetLog = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/log`
    })
}

export const getTimesheetReport = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/report`
    })
}

export const getSummary = ( params = {} ) => {
    return axios_hr({
        method: 'GET',
        params,
        url: `${prefix}/summary`
    })
}

export const importTimesheet = (data) => {
    return formData_hr({
        method: 'POST',
        data,
        url: `${prefix}/log/import`
    })
}

export const getShifts = () => {
    return axios_hr({
        method: 'GET',
        url: `${prefix}/get-shifts`
    })
}

export default {
    getList,
    getTimesheetLog,
    getTimesheetReport
}