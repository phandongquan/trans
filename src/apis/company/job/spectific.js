import axios from '~/utils/request_tuyendung';
import formData from '~/utils/formData_tuyendung';
import { WS_TUYENDUNG } from '~/constants/index'

const prefix = 'job-test-questions';

export const getLinkTest = (exam_id) => {
    return axios({
        method: 'GET',
        url: `${WS_TUYENDUNG}/${prefix}/get-link-test?exam_id=${exam_id}`
    })
}

export const initQuestion = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${WS_TUYENDUNG}/${prefix}/init-question`
    })
}

export const createQuestion = (data = {}) => {
    return axios({
        method: 'POST',
        data: {
            ...data
        },
        url: `${WS_TUYENDUNG}/${prefix}`
    })
}

export const deleteQuestion = (id) => {
    return axios({
        method: 'DELETE',
        url: `${WS_TUYENDUNG}/${prefix}?question_id=${id}`
    })
}

export const getListQuestion = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${WS_TUYENDUNG}/${prefix}`
    })
}

export const detail = (id, params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${WS_TUYENDUNG}/${prefix}?question_id=${id}`
    })
}

export const update = (data = {}) => {
    return axios({
        method: 'POST',
        data: {
            ...data
        },
        url: `${WS_TUYENDUNG}/${prefix}/answer`
    })
}

export const getAnswerById = (id, params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${WS_TUYENDUNG}/${prefix}/answer?answer_id=${id}`
    })
}

export const deleteAnswer = (id) => {
    return axios({
        method: 'DELETE',
        url: `${WS_TUYENDUNG}/${prefix}/answer?answer_id=${id}`
    })
}

export const activeMultipleQuestions = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${WS_TUYENDUNG}/${prefix}/status`
    })
}

export const exportQuestion = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${WS_TUYENDUNG}/${prefix}/export`
    })
}

export const importQuestion = (data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `/${prefix}/import`
    })
}

export default {
    getListQuestion,
    detail,
    update,
    getAnswerById,
    deleteAnswer,
    createQuestion,
    deleteQuestion,
    initQuestion,
    getLinkTest,
    activeMultipleQuestions,
    exportQuestion,
    importQuestion
}