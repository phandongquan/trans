import axios from '~/utils/request_hr';

const prefix = '/hr/document/types';
const prefix_update = '/hr/document/type';

export const getTypes = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const updateType = (id,data) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix_update}/`+id
    })
}

export const deleteType = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix_update}/`+id
    })
}

export default {
    getTypes,
    updateType
}