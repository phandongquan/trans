import axios from '~/utils/request_hr';

const prefix = 'hr/report/staff';

export const getStaffReport = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}


export default {
    getStaffReport
}