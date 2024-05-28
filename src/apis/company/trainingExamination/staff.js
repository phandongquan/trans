import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr'

const prefix = '/hr/my-exam';

/**
 * Get TrainingExaminationStaff
 * 
 * @param {*} id 
 * @param {*} params 
 */
export const history = (id, params = {}) => {

    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/history/${id}`
    })
}

/**
 * Update TrainingExaminationStaff examination_result
 * 
 * @param {*} id 
 * @param {*} params 
 */
export const updateResult = (id, data = {}) => {
    return axios({
        method: 'PUT',
        data,
        url: `${prefix}/history/${id}`
    })
}
export const updateReview = (id, data = {}) => {
    return axios({
        method: 'PUT',
        data,
        url: `${prefix}/update-field/${id}`
    })
}

export const updateResultFormData = (id, data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/history/${id}`
    })
}

/**
 * approve skill level
 */
export const approveLevel = (data ={}) =>{
    return axios({
        method: 'POST',
        data,
        url: `hr/training-exam/approve`
    })
}

/**
 * approve skill level
 */
 export const UnApproveLevel = (data ={}) =>{
    return axios({
        method: 'POST',
        data,
        url: `hr/training-exam/unapprove`
    })
}

/**
 * Generate question
 * @param {*} params 
 * @returns 
 */
export const generateQuestion = (params) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/generate-question`
    })
}

/**
 * Remove file
 * @param {*} params 
 * @returns 
 */
export const removeFile = (params) => {
    return axios({
        method: 'DELETE',
        params,
        url: `${prefix}/remove-file`
    })
}

export default {
    history,
}
