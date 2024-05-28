import axios from '~/utils/request_hr';

const prefix = '/hr/language';

export const list = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}

export const save = (id, params = {}) => {
    return axios({
        method: 'POST',
        params,
        url: `${prefix}/${id}`
    })
}

export const destroy = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}