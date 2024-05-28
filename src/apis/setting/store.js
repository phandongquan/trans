import axios from '~/utils/request'

const prefix = '/setting/store';

export const getList =(params={})=> {
    return axios({
        method: 'GET',
        params: {
            status: 1,
            ...params,
        },
        url: `${prefix}`
    })
}

export const create =(data)=> {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}
export const getDetail =(id, params)=> {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/${id}`
    })
}

export const update =(id, data)=> {
    return axios({
        method: 'PUT',
        data,
        url: `${prefix}/${id}`
    })
}

export const destroy =(id)=> {
    return axios({
        method: 'POST',
        url: `${prefix}/${id}/delete`
    })
}

// params: q, ids
export const search =(params)=> {
    return axios({
        method: 'GET',
        url: `${prefix}/search`,
        params: {
            sort: 'store_id',
            status: 1,
            offset: 0,
            limit: 10,
            ...params
        }
    })
}
