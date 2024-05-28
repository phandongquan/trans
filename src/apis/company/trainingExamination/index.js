import axios from '~/utils/request_hr';


const prefix = 'hr/training-exam';

export const getList = (params = {}) => {

    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}
export const getListExam = (params = {}) => {

    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: 'mobile/exam-staff/list-skill'
    })
}
export const destroy = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}

export const detail = (id, data = {}) => {
    return axios({
        method: 'GET',
        data,
        url: `${prefix}/${id}`
    })
}

export const create = (data) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}

export const update = (id, data) => {
    return axios({
        method: 'PUT',
        data,
        url: `${prefix}/${id}`
    })
}
/**
 * Preview Question of Training Examination
 * @param {*} id 
 */
export const preview = (id) => {
    return axios({
        method: 'GET',
        url: `${prefix}/${id}/preview`
    })
}

/**
 * Add staff for TrainingExamination
 * 
 * @param {*} id 
 * @param {*} data 
 */
export const addStaffExam = (id, data) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/${id}/add-staff`
    })
}

/**
 * 
 * @param {int} id - TrainingExamination ID
 * @param {int} itemId - TrainingExaminationStaff ID
 */
export const removeStaffExam = (id, itemId) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/${id}/staff/${itemId}`
    })
}

export const getResultList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/result`
    })
}

export const updateStatus = (data = {}) => {
    return axios({
        method: 'PUT',
        data,
        url: `${prefix}/update-status`
    })
}

export const getStaffBySkill = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/staff-by-skill`
    })
}

export const checkStaffThroughSkill = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/check-staff-through-skill`
    })
}

export const applyTime = (data = {}) => {
    return axios({
        method: 'PUT',
        data,
        url: `${prefix}/apply-time`
    })
}



export default {
    getList,
    destroy,
    detail,
    create,
    update,
    preview,
    addStaffExam,
    removeStaffExam,
    getStaffBySkill,
    checkStaffThroughSkill
}
