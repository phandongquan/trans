import axios from '~/utils/request'

const prefix = '/setting/role';

export const getList =(params={})=> {
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
