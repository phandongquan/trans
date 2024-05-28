import axios from '~/utils/request_hr';

const prefix = '/hr/document/categories';
const prefix_update = '/hr/document/category';

export const getCategories = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const updateCategory = ( id,data ) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix_update}/`+id
    })
}

export default {
    getCategories,
    updateCategory
}