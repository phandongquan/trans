import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';

const prefix = '/hr/manage-electric';

//get list daily
export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/report-daily`
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
//get list month
export const getListMonthly = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/report-monthly`
    })
}

//get List Location
export const getListLocationsConfig = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/electrics`
    })
}
//get List Location
export const createLocationConfig = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/add-electric`
    })
}
//get List Location
export const updateLocationConfig = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/add-electric`
    })
}
export const destroy = (id = 0) =>{
    return axios({
        method: 'DELETE',
        url: `${prefix}/delete-electric/${id}`
    })
}
export const reloadList = (params={}) =>{
    return axios({
        method: 'GET',
        params : {
            ...params
        },
        url: `${prefix}/request`
    })
}