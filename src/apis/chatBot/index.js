import axios from '~/utils/request_hr';
const prefix = '/v2/chat-bot'

export const getListMessage = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/get-list-message`
    })
}

export const getListMessageNotSent = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/get-list-message-not-sent`
    })
}

export const getOneMessage = (id) => {
    return axios({
        method: 'GET',
        url: `${prefix}/get-one-message/${id}`
    })
}

export const createMessage = (data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/create-message`
    })
}

export const markSentMessages = (data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/mark-sent-messages`
    })
}

export const updateMessage = (data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/update-message`
    })
}

export const deleteMessage = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/delete-message/${id}`
    })
}

export const deleteMultipleMessage = (data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/delete-multiple-messages`
    })
}
