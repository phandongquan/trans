import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';

const prefixV2 = '/v2/toolsAI'

export const createAnalysisImage = (data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefixV2}/create-analysis-image`,
    })
}

export const updateAnalysisImage = ({ id, data = {} }) => {
    return formData({
        method: 'PUT',
        data,
        url: `${prefixV2}/update-analysis-image/${id}`,
    })
}

export const deleteAnalysisImage = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefixV2}/delete-analysis-image/${id}`,
    })
}

export const getOneAnalysisImage = (id) => {
    return axios({
        method: 'GET',
        url: `${prefixV2}/get-one-analysis-image/${id}`,
    })
}

export const getListAnalysisImage = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefixV2}`,
    })
}

export const getListAnalysisImageByImage = (data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefixV2}/search-by-image`,
    })
}

export const importFileXLSX = (data = []) => {
    return axios({
        method: 'POST',
        data: {
            rows: data
        },
        url: `${prefixV2}/import-file-xlsx`,
    })
}