import axios from '~/utils/request_hr';
const prefix = '/hr/history-location';
export const apiListHistory = (params = {}) =>{
    return axios({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}