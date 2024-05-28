import axios from '~/utils/request_tuyendung';
import formData from '~/utils/formData_tuyendung';


const prefix = '/job-criterias';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}
export const detail = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}
// export const create = (data = {}) => {
//     return axios({
//         method: 'POST',
//         data,
//         url: `${prefix}`
//     })
// }
export const update = (data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}
export const updateStatus = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/status`
    })
}
export const getListCriteriaJob = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/save`
    })
}
export const updateListCriteriaJob = (params = {}, data = []) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        data,
        url: `${prefix}/save`
    })
}

export const importJobCriteria = (data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/import`
    })
}

export const exportJobCriteria = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/export`
    })
}