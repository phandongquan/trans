import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';

const prefix = '/hr/room-meeting';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const create = (data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}

export const update = (id=0, data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/${id}`
    })
}

export const destroy = (id = 0) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}
