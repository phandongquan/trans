import axios from '~/utils/request';
import formData from '~/utils/formData';

const prefix_Asset = '/inventory/asset';
const prefix_Stock = '/inventory/stock/adjustment';

export const getListAsset = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix_Asset}`
    })
}
export const getListStock = (params = {}) =>{
    return axios({
        method: 'GET',
        params,
        url: `${prefix_Stock}`
    })
}
export const product = (params = {}) =>{
    return axios({
        method: 'GET',
        params,
        url: `/sales/product`
    })
}
