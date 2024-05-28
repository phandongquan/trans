import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';
const prefix = '/hr/ai-log-customer';


// export const getList = (params = {}) => {
//     return axios({
//         method: 'GET',
//         params: {
//             ...params
//         },
//         url: `${prefix}`
//     })
// }

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/report`
    })
}


export const reportByStore = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/report-store`
    })
}
export const getListTop = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/report-top-10`
    })
}