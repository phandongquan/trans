import axios from '~/utils/request'
const prefix = '/inventory/stock';

export const getList =(params={})=> {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}