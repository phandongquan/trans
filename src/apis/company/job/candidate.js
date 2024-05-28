import axios from '~/utils/request_tuyendung';
import formData from '~/utils/formData_tuyendung';

const prefix = '/candidates';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const getByJob = (jobId, params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `/hr/job/${jobId}/candidates`
    })
}

export const create = (data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}

export const detail = (id, params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/${id}`
    })
}

export const update = (id, data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/${id}`
    })
}
export const getListInterview = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/result`
    })
}
export const getDetailInterview = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `/mobile/criteria-list`
    })
}
export const updateDetailInterview = (params = {}, data = {}) => {
    return axios({
        method: 'POST',
        params,
        data,
        url: `${prefix}/criteria-result`
    })
}
export const getResultDetailInterview = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/criteria-result`
    })
}

export const interviewSendMail = (id) => {
    return axios({
        method: 'GET',
        url: `${prefix}/interview-send-mail?exam_id=${id}`
    })
}

export const interviewSendMailOffer = (id) => {
    return axios({
        method: 'GET',
        url: `${prefix}/offer-letter-send-mail?exam_id=${id}`
    })
}

export const interviewSendMailCreate = (id, data) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/interview-send-mail?exam_id=${id}`
    })
}

export const interviewSendMailOfferCreate = (id, data) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/offer-letter-send-mail?exam_id=${id}`
    })
}

export const getMailThanks = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/thanks-send-mail`
    })
}

export const sendMailThanks = (data = {}, exam_id) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/thanks-send-mail?exam_id=${exam_id}`
    })
}

export const getListLogSendMail = (params = {}) => { 
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/log-mails`
    })
}

export default {
    getList,
    interviewSendMail,
    interviewSendMailCreate
}