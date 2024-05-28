import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';

const prefix = '/hr/music';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/songs?type=0`
    })
}
export const getListAdvertisement = (params = {}, type = 1) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/songs?type=${type}`
    })
}

export const create = (data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/songs`
    })
}

export const update = (id=0, data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/songs/${id}`
    })
}

export const destroy = (id = 0) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/songs/${id}`
    })
}

export const updatePriority = (data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/songs/update-priority`
    })
}
export const getListFolder = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/songs/folder`
    })
}
export const createFolder = (data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/songs/folder`
    })
}
export const updateFolder = (id=0, data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/songs/folder/${id}`
    })
}
export const destroyFolder = (id = 0) => {
    return axios({
        method: 'DELETE',
        url: `${prefix}/songs/folder/${id}`
    })
}
export const addSongFolder = (id = 0 , data = {}) =>{
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/songs/add-folder/${id}`
    })
}
export const removeSongFolder = (id = 0 , params = {}) =>{
    return axios({
        method: 'DELETE',
        params: {
            ...params
        },
        url: `${prefix}/songs/remove-songs/${id}`
    })
}
export const activeFolder = (id=0, data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/songs/folder/active/${id}`
    })
}
export const getListLogShop = (params = {}) => {
    ///hr/music/songs/locations-active
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/songs/locations-active`
    })
}
export const getLogDetail = () => {
    return axios({
        method: 'GET',
        url: `${prefix}/songs/folder/log`
    })
}