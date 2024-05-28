
import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';

const prefix = '/hr/training-question';


export const getList = (params = {}) => {

    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const create = (data) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}

export const detail = (id, data = {}) => {
    return axios({
        method: 'GET',
        data,
        url: `${prefix}/${id}`
    })
}

export const update = (id, data) => {
    return axios({
        method: 'PUT',
        data,
        url: `${prefix}/${id}`
    })
}


export const destroy = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}


export const deleteAnswer = (id_question,id_answer) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/${id_question}/answer/${id_answer}`
    })
}


export const addAnswer = (id_question,data) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/${id_question}/add-answer`
    })
}


export const updateAnswer = (id_question,data) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/${id_question}/update-answer`
    })
}

export const importQuestion = (data) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/import`
    })
}
export const massUpdate = ( data => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/mass-update`
    })
})


export default {
    getList,
    destroy,
    update,
    create,
    addAnswer,
    updateAnswer,
    importQuestion,
    massUpdate
}