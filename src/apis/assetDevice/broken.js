import formData_hr from '~/utils/formData_hr';
import axios_hr from '~/utils/request_hr';
const prefix = '/hr/asset-device/broken'

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
