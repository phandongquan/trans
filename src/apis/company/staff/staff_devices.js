import formData from '~/utils/formData';
import axios_hr from '~/utils/request_hr';

const prefix = '/hr/staff-tracking/list-device-app';


export const getListDevices = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}

