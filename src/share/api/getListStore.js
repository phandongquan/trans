import axios from '~/utils/request'

export default (params)=> {
    return axios({
        method: 'GET',
        params: {
            store_status: 1,
            ...params
        },
        url: `/setting/store`
    })
}

