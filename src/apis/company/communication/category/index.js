import axios from '~/utils/request_hr';

const prefix = '/hr/information/categories';
const prefixEditAndUpdate = '/hr/information/category';

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
        url: `${prefixEditAndUpdate}/0`
    })
}
export const update = (id, data) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefixEditAndUpdate}/${id}`
    })
}
export const detail = (id, data = {}) => {
    return axios({
        method: 'GET',
        data,
        url: `${prefixEditAndUpdate}/${id}`
    })
}

export const deleteCommunication = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/` + id
    })
}

export const destroyCategory = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefixEditAndUpdate}/${id}`
    })
}


export default {
    getList,
    create,
    detail,
    update,
    deleteCommunication
}