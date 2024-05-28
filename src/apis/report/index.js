import axios from '~/utils/request'

const prefix = '/report';

export const getListCallLog =(params={})=> {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/call-log`
    })
}