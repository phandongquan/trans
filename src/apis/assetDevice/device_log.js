import axios_hr from '~/utils/request_hr';
const prefix = '/hr/asset-device/log'

export const list = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const report = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/report`
    })
}