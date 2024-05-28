import axios from '~/utils/request_hr';
import formData_hr from '~/utils/formData_hr';

const prefix = '/news/groups';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/need-approved-list`
    })
}

export const approved = (id = 0) => {
    return axios({
        method: 'POST',
        url: `${prefix}/approve/${id}`
    })
}

export const destroy = (id = 0) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}

export const update = (id = 0, data={}) => {
    return formData_hr({
        method: 'POST',
        data,
        url: `${prefix}/${id}`
    })
}