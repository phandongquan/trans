import formData_hr from '~/utils/formData_hr';
import axios_hr from '~/utils/request_hr';
const prefix = '/hr/asset-device/group'

export const list = (params = {}) => {
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

export const save = (id, data = {}) => {
    return axios_hr({
        method: 'POST',
        data,
        url: `${prefix}/${id}`
    })
}
export const saveV2 = (id,data = {}) => {
    return formData_hr({
        method: 'POST',
        data,
        url: `${prefix}/${id}`
    })
}

export const getGroupByAsset = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params,
        url: `${prefix}/get-by-asset`
    })
}

export const connectAsset = (data = {}) => {
    return axios_hr({
        method: 'POST',
        data,
        url: `${prefix}/connect-asset`
    })
}

export const getMaintenaceByAsset = (id, params = {}) => {
    return axios_hr({
        method: 'GET',
        params,
        url: `${prefix}/get-maintenace-by-asset/${id}`
    })
}

export const destroy = (id) => {
    return axios_hr({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}