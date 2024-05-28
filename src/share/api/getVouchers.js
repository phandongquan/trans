import axios from '~/utils/axios_inside'

export default ()=> {
    return axios({
        method: 'GET',
        params: {
            status: 1
        },
        url: `/sales/voucher`
    })
}

