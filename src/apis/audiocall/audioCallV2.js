import axios from '~/utils/request_ai'

const prefix = '/control';
export const getListAudioV2 = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/getAudioDataT2S`
    })
}
export const updateTextAudioV2 = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/updateAudioDataT2S`
    })
}

export const deleteAudioV2 = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/deleteAudioDataT2S`
    })
}