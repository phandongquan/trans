import axios_hr from '~/utils/request_hr';
import formData_hr from '~/utils/formData_hr';
const prefix = '/hr/asset-device/criterions/log'

export const list = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const saveLog = (id, data = {}) => {
    return formData_hr({
        method: 'POST',
        data,
        url: `/hr/asset-device/criterions/save-log/${id}`
    })
}