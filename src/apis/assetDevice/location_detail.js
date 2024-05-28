import formData_hr from '~/utils/formData_hr';
import axios_hr from '~/utils/request_hr';
const prefix = '/hr/qr-mapping/location-detail'

export const getList = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const detail = (id, data = {}) => {
    return axios_hr({
        method: 'GET',
        data,
        url: `${prefix}/${id}`
    })
}

export const save = (id = 0 , data = {}) => {
    return formData_hr({
        method: 'POST',
        data,
        url: `${prefix}/${id}`
    })
}

export const destroy = (id) => {
    return axios_hr({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}