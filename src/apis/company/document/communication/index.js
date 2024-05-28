import axios from '~/utils/request_hr';

const prefixV2 = 'v2/document';

export const getListManagementCommunication = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefixV2}/list-management-communication`
    })
}

export default {
    getListManagementCommunication
}