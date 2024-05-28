import axios_hr from '~/utils/request_hr';
import formData_hr from '~/utils/formData_hr';
const prefix = '/hr/staff/manpower';

export const getList = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const insert = (data = {} ) => {
    return axios_hr({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}
export const update = (id , data = {} ) => {
    return axios_hr({
        method: 'PUT',
        data,
        url: `${prefix}/${id}`
    })
}
export const apiDelete = (id ) => {
    return axios_hr({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}