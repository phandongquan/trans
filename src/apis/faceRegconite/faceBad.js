import axios from '~/utils/request_ai'

const prefix = '/face/badFaces';


export const getList = (params = {}) => {
    return axios({
        method: 'POST',
        params,
        url: `${prefix}`
    })
}

export const updatedFace = (params = {}) => {
    return axios({
        method: 'POST',
        params,
        url: `/face/updateFaces?`
    })
}
