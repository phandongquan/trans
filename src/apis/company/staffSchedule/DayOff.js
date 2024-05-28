import axios from '~/utils/request';
import axios_hr from '~/utils/request_hr';
import formData_hr from '~/utils/formData_hr';
const prefix = '/hr/staff-schedule/day-off';

export const getListDayOff = (params = {}) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const createDayOff = (data) => {
    return axios_hr({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}

export const detailDayOff = ( id, params ) => {
    return axios_hr({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/` + id
    })
}

export const updateDayOff = ( id, data ) => {
    return axios_hr({
        method: 'POST',
        data,
        url: `${prefix}/`+id
    })
}

export const deleteDayOff= ( id ) => {
    return axios_hr({
        method: 'DELETE',
        url: `${prefix}/`+id
    })
}