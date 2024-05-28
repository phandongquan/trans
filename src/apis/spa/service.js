import axios from '~/utils/request'

const prefix = '/spa/service';

export const search = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            status: 1,
            service_id: 1, //UNKNOWN
            ...params,
        },
        url: `${prefix}`
    })
}
