import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';
const prefix = '/hr/projects';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/list-task-staff-group`
    })
}
export const create = (data) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/task-staff-group`
    })
}
export const update = (id, data) => {
    return axios({
        method: 'PUT',
        data,
        url: `${prefix}/task-staff-group/${id}`
    })
}
export const detail = (id, data = {}) => {
    return axios({
        method: 'GET',
        data,
        url: `${prefix}/task-staff-group/${id}`
    })
}
export const deleteStaffGroup = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/task-staff-group/` + id
    })
}