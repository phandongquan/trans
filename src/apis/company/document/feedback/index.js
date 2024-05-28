import axios from '~/utils/request_hr';

const prefix = '/hr/document/feedback';

export const getFeedbacks = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const updateFeedbacks = (id,data) => {
    return axios({
        method: 'PUT',
        data,
        url: `${prefix}/`+id
    })
}

export const deleteFeedback = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/`+id
    })
}



export default {
    getFeedbacks,
    updateFeedbacks
}