import axios from '~/utils/request';
import formData from '~/utils/formData';
import axios_hr from '~/utils/request_hr';

const prefix = '/hr/staff-management-major';


export const getList = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}

export const update = ( id = 0 , data = {}) => {
    return axios_hr({
        method : 'POST',
        data ,
        url: `${prefix}/${id}`
    })
}
export const create = (data = {}) => {
    return axios_hr({
        method : 'POST',
        data ,
        url: `${prefix}/0`
    })
}