import axios from '~/utils/request'

const prefix = '/setting/department';

export const getList =(params={})=> {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}