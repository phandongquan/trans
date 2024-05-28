import axios from '~/utils/request'

const prefix = '/setting/upload';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}

export const getListObject = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/object`
    })
}

export const getListType = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/type`
    })
}
export const getListLink = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `/setting/upload-link`
    })
}

export const create = () => {

}