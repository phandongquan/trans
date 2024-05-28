import axios from '~/utils/request'
import axios_hr from '~/utils/request_hr'

const prefix = '/auth';

export const login = (data = {}) => {
    return axios_hr({
        method: 'POST',
        url: `${prefix}/login`,
        data
    })
}

export default {
    login
}
