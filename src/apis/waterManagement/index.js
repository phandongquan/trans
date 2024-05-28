import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';

const prefix = '/hr/manage-water';

//Account Config
export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/waters`
    })
}
// get list invoices
export const getListInvoices = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/report-excel`
    })
}
export const createAccountConfig = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/add-water`
    })
}
export const updateAccountConfig = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/add-water`
    })
}
export const deleteAccountConfig = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/delete-water/${id}`
    })
}


//get list daily
export const getReportDailyWater = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/report-daily`
    })
}
// get list monthly
export const getListMonthlyWater = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/report-monthly`
    })
}
