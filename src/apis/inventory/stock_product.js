import axios from '~/utils/request';
import md5 from 'md5'
const prefix = '/inventory/stock-product';



export const getList =(params={})=> {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const getListFromHasaki =(params={})=> {
    return axios({
        method: 'GET',
        params: {
            secret: 'test.hasaki.vn',	
            token: md5('test.hasaki.vn#'+params.product_sku),
            page: 1,
            size: 1,
            ...params
        },
        url: `https://test.hasaki.vn/rest/V1/inside/inventory/stock/list`
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
        method: 'POST',
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

