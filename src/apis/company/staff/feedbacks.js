// import formData from '~/utils/formData';
import formData_hr from '~/utils/formData_hr';
import axios_hr from '~/utils/request_hr';
const prefix = '/news/feedback';

export const getList = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params,
        },
        url: `${prefix}`
    })
}

export const apiDeleteFeedback = (id) => {
    return axios_hr({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}

export const updateStatus = (id ,data = {}) => {
    return formData_hr({
        method: 'POST',
        data,
        url: `${prefix}/${id}`
    })
}
export const updateType = (id ,data = {}) => {
    return axios_hr({
        method: 'PUT',
        data,
        url: `${prefix}/update/${id}`
    })
}
// import axios from '~/utils/request_hr';
// import formData from '~/utils/formData_hr';

const prefixComment = '/news/comments';

export const apiListComment = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params,
        },
        url: `${prefixComment}`
    })
}
export const apiReplyFeedbacks = (data = {}) =>{
    return formData_hr({
        method: 'POST',
        data,
        url: `${prefixComment}`,
    })
}
export const apiDeleteReply = (id) => {
    return axios_hr({
        method: 'DELETE',
        url: `${prefixComment}/${id}`
    })
}
const prefixType = '/news/feedback/options'
export const apiListType = (params = {}) => {
    return axios_hr({
        method: 'GET',
        // params: {
        //     ...params,
        // },
        url: `${prefixType}`
    })
}
export const apiDeleteType = (id) => {
    return axios_hr({
        method: 'DELETE',
        url: `${prefixType}/${id}`
    })
}
export const apiAddType = (data = {}) => {
    return formData_hr({
        method: 'POST',
        data ,
        url: `${prefixType}`
    })
}
export const apiUpdateType = (id ,data = {}) => {
    return formData_hr({
        method: 'POST',
        data,
        url: `${prefixType}/${id}`
    })
}
export const apiDetailType = (id) => {
    return axios_hr({
        method: 'GET',
        url: `${prefixType}/${id}`
    })
}