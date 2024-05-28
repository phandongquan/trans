import axios from '~/utils/request_api_work'
const prefix = '/inside/bin_location/';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}