import axios from '~/utils/request_temp';
const prefix = '/hr/staff';

export const create = (data) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}

export default {
    create,
}