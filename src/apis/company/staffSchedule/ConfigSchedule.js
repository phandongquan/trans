import axios from '~/utils/request';
import axios_hr from '~/utils/request_hr';
import formData_hr from '~/utils/formData_hr';
const prefix = '/hr/staff-schedule/config';

export const getListConfig = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const createConfig = ( data) => {
    return axios_hr({
        method: 'POST',
        data,
        url: `${prefix}/0`
    })
}

export const detailConfig = ( id, params ) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/` + id
    })
}

export const updateConfig = ( id, data ) => {
    return axios_hr({
        method: 'POST',
        data,
        url: `${prefix}/`+id
    })
}

export const deleteConfig= ( id ) => {
    return axios_hr({
        method: 'DELETE',
        url: `${prefix}/`+id
    })
}