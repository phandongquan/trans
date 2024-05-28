import axios from '~/utils/request'

const prefix = '/setting/location';

export const getList =(params={})=> {
    return axios({
        method: 'GET',
        params: {
            ...params
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