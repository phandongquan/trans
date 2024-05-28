import axios from '~/utils/request'
import axios_hr from '~/utils/request_hr'

const prefix = '/setting/user';

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

export const updateLanguage = async(id, data)=> {
    const token = localStorage.getItem('client_hasaki_inside_token');
    return axios_hr({
        method: 'PUT',
        data,
        url: `${prefix}/${id}`,
        headers: {
            Authorization: `Bearer ${token}`
        }
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
        url: `${prefix}`,
        params: {
            sort: 'id',
            offset: 0,
            limit: 10,
            ...params
        }
    })
}

export const profile =()=> {
    return axios_hr({
        method: 'GET',
        url: `${prefix}/profile`
    })
}
export const ipPublic =()=> {
    return axios({
        method: 'GET',
        url: `${prefix}/ip-public`
    })
}