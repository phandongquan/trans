import axios from '~/utils/request_ai'

const prefix = '/control/iso/camera-logs';
export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}