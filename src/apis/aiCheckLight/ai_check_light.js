import axios from '~/utils/request_ai'

const prefix = '/control/check_light_is_on';
export const getListCamera = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}
export const getListLocation = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/clientList`
    })
}
export const addNewCamera = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/addClient`
    })
}
export const reloadClient = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/reloadClient`
    })
}
export const deleteShop = (params = {}) =>{
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/removeClient`
    })
}


export const submitCanvas = (params = {}) =>{
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/config`
    })
}


export const getImageCamera = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/getOriginFrame`
    })
}
//
export const getTask = (params = {}) => {
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/getTask`
    })
}

export const editShop = (params = {}) =>{
    //https://ai.hasaki.vn/control/nodeUpdate
    return axios({
        method: 'POST',
        params : {
            ...params
        },
        url: `/control/nodeUpdate`
    })
}
export const apiAssignTask = (params = {}) =>{
    //https://ai.hasaki.vn/control/nodeAssignTask
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `/control/nodeAssignTask`
    })
}
export const apiRemoveTask = (params = {}) =>{
    //https://ai.hasaki.vn/control/nodeReleaseTask
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `/control/nodeReleaseTask`
    })
}
export const apiDeleteShop = (params = {}) =>{
    //https://ai.hasaki.vn/control/nodeRemove
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `/control/nodeRemove`
    })
}
export const apiRemoveChannelCam = (params = {}) =>{
    return axios({
        method: 'POST',
        params: {
            ...params
        },
        url: `${prefix}/removeClient`
    })
}



//group camera 
export const getShopStatus = (params = {}) =>{
    //https://ai.hasaki.vn/controlnodeStatus
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `/control/nodeStatus`
    })
}
export const editNameShop = (params = {}) =>{
    //https://ai.hasaki.vn/control/nodeUpdate
    return axios({
        method: 'POST',
        params : {
            ...params
        },
        url: `/control/nodeStatus/update-nickname`
    })
}
export const updateIpShop = (params = {}) =>{
    //https://ai.hasaki.vn/control/nodeUpdate
    return axios({
        method: 'POST',
        params : {
            ...params
        },
        url: `/control/nodeStatus/update-camera-src`
    })
}
