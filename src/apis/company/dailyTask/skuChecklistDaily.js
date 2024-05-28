import axios from '~/utils/request_hr';
const prefix = '/hr/task-daily';
export const apiListDaily = (params = {}) =>{
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/list-sku-daily`
    })
}