import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';

const prefix = '/hr/training-question-feedbacks';


export const getListFeedbacks = (params = {}) => {

    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const approve = (id, data) => {
    return axios({
        method: 'PUT',
        data,
        url: `${prefix}/${id}`
    })
}


