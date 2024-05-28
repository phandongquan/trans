import axios from '~/utils/request_hr';

const prefix = '/hr/workflows/assign';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const create = (data) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}

export const destroy = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}