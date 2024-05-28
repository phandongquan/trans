import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';

const prefixV2 = '/v2/face-log'
const URL_V1 = 'https://face-log.run.app.rdhasaki.com'
const isProduction = process.env.REACT_APP_ENV === 'production'

export const getReportCheckoutList = (params = {}) => {
    let url =`${prefixV2}/report/checkout-list`
    return axios({
        method: 'GET',
        params,
        url: url,
    })
}

export const getESLog = (params = {}) => {
    let url = `${prefixV2}/es/log`
    return axios({
        method: 'GET',
        params,
        url: url,
    })
}

export const getCustomerSearch = (params = {}) => {
    let url = `${prefixV2}/customer/search`
    return axios({
        method: 'GET',
        params,
        url: url,
    })
}

export const postSearchByFace = (data = {}) => {
    let url = `${prefixV2}/es/search-by-face`
    return formData({
        method: 'POST',
        data,
        url: url,
        headers: { "Content-Type": "multipart/form-data" },
    })
}

export const putCustomerUpdateByLogId = (params = {}) => {
    let url =`${prefixV2}/customer/update-by-log-id`
    return axios({
        method: 'PUT',
        params,
        url: url,
    })
}

export const postImageRegister = (data = {}) => {
    let url = `${prefixV2}/es/image-register`
    return formData({
        method: 'POST',
        data,
        url: url,
        headers: { "Content-Type": "multipart/form-data" },
    })
}

export const getReturningRate = (params = {}) => {
    let url = `${prefixV2}/report/returning-rate`
    return axios({
        method: 'GET',
        params,
        url: url,
    })
}

export const deleteES = (params = {}) => {
    let url = `${prefixV2}/es/`
    return axios({
        method: 'DELETE',
        params,
        url: url,
    })
}