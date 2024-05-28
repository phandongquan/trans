import axios from '~/utils/request_hr';

const prefix = '/hr/workflows/category';

export const getListCategory = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}
/**
 * create skill
 * 
 * @param {*} data 
 */
export const createCategory = (data) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}
export const updateCategory = (id, data) => {
    return axios({
        method: 'PUT',
        data,
        url: `${prefix}/${id}`
    })
}
export const detailCategory = (id, data = {}) => {
    return axios({
        method: 'GET',
        data,
        url: `${prefix}/${id}`
    })
}

export const destroyCategory = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}

export default {
    getListCategory,
    createCategory,
    updateCategory,
    detailCategory,
    destroyCategory
}