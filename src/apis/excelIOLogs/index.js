import formData_hr from '~/utils/formData_hr';
import axios from '~/utils/request_hr';
const prefix = '/hr/excel-io';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const updateCount = (logId) => {
    return axios({
        method: 'POST',
        url: `${prefix}/update-count/${logId}`
    })
}

export const exportBackground = (data = {}) => {
    return formData_hr({
        method: 'POST',
        data,
        url: `${prefix}/export`
    })
}

export const importBackground = (data = {}) => {
    return formData_hr({
        method: 'POST',
        data,
        url: `${prefix}/export`
    })
}

export default {
    getList,
    updateCount
}