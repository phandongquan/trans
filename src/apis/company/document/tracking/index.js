import axios from '~/utils/request_hr';

const prefixV2 = 'v2/document';

export const getListTrackingByDocumentId = (id, params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefixV2}/information/tracking/${id}`
    })
}

export const trackingDocument = (id, data = {}) => {
    return axios({
        method: 'POST',
        data: {
            ...data
        },
        url: `${prefixV2}/tracking/${id}`
    })
}

export const updateCommunication = (data = {}) => {
    return axios({
        method: 'PUT',
        data: {
            ...data
        },
        url: `${prefixV2}/tracking/update-communication`
    })
}

export const deleteCommunication = (data = {}) => {
    return axios({
        method: 'PUT',
        data: {
            ...data
        },
        url: `${prefixV2}/delete/tracking`
    })
}

export const pushNotifyCommunication = (id) => {
    return axios({
        method: 'GET',
        url: `${prefixV2}/push-notify-communication/${id}`
    })
}