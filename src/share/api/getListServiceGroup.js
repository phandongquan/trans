import axios from '~/utils/request'

export default (params)=> {
    return axios({
        method: 'GET',
        params: {
            service_group_status: 1,
            ...params
        },
        url: `spa/servicegroup`
    })
}

