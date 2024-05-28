import axios from '~/utils/request'

const prefix = '/report/receipt-detail';

export const getList =(params={})=> {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}