import axios from '~/utils/request_hr'

const prefix = '/hr/ai-detect';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}
