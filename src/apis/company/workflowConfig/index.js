import formData_hr from '~/utils/formData_hr';
import axios from '~/utils/request_hr';

const prefix = '/hr/workflow-config';

export const save = (data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}

export const destroy = (params = {}) => {
    return axios({
        method: 'POST',
        params,
        url: `${prefix}/mass-delete`
    })
}
export const updatePriorityFormConfig = (data = {}) => {
    return formData_hr({
        method: 'POST',
        data,
        url: `${prefix}/update-priority`
    })
}