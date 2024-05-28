import axios from '~/utils/request_ai'

const prefix = '/ai/faces';


export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}
export const getListFacelogDebug = (params = {}) => {
    return axios({
        method: 'POST',
        params,
        url: `/face/log`
    })
}
export const deleteCustomer = (params = {}) => {
    return axios({
        method: 'POST',
        params,
        url: `/face/delFace`
    })
}
export const getDebug = (params = {}) =>{
    return axios({
        method: 'POST',
        params,
        url: `/face/landmarkdebug`
    })
}
export const deleteLogCustomer = (params = {}) => {
    return axios({
        method: 'POST',
        params,
        url: `/face/delLogFace`
    })
}


export const getListFacelogDebugV2 = (params = {}) => {
    return axios({
        method: 'POST',
        params,
        url: `/face/v2/log`
    })
}