import axios from '~/utils/request_hr';
const prefix = '/hr/staff-notification';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const getListDevices = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/devices`
    })
}

export const destroy = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}

export default {
    getList,
    getListDevices,
    destroy
}