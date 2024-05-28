import axios from '~/utils/request_ai'

const prefix = '/control';
export const getListAudio = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/getAudioData`
    })
}
export const updateTextAudio = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/updateAudioData`
    })
}

export const deleteAudio = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/deleteAudioData`
    })
}