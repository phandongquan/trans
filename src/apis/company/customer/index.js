import axios from '~/utils/request';
import formData from '~/utils/formData';
const prefix = '/sales/customer';

export const getDetailByPhone = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}


export default {
    getDetailByPhone
}