import axios from '~/utils/request_hr';


const prefix = "hr/staff-tracking";

export const getListTrackingWifi = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/logged-in`
    })
}