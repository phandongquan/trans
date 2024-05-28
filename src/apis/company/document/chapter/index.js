import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';

const prefix = '/hr/document-chapter';

export const getChapters = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}

export const createChapter = (data) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}

export const getChapterDetail = (ID) => {
    return axios({
        method: 'GET',
        url: `${prefix}/`+ID
    })
}

export const updateChapter = ( id, data ) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/`+id
    })
}

export const deleteChapter = (id, params = {}) => {
    return axios({
        method: 'DELETE',
        params: params,
        url: `${prefix}/`+id
    })
}

export const deleteChapterDraft = (params = {}) => {
    return axios({
        method: 'DELETE',
        params: params,
        url: `${prefix}/delete-draft`
    })
}

export const updateChapterDraft = (data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/update-draft`
    })
}

export default {
    getChapters,
    createChapter,
    getChapterDetail,
    updateChapter
}