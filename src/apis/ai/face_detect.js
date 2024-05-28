import axios from '~/utils/request_ai'

const prefix = '/face';
export const detectCustomer = (data) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}
