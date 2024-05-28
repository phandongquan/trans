import axiosApiWork from '~/utils/request_api_work';
import axios from '~/utils/request_hr';


const prefix = '/inside/inventory/daily_checklist_count';

export const getVerifySkuByDepartment = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `/hr/task-daily/report-performance-verify-sku`
    })
}
// export const getList = (params = {}) => {
//     return axiosApiWork({
//         method: 'GET',
//         params,
//         url: `${prefix}`
//     })
// }
export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `/hr/sku-checklist`
    })
}

export const updateCorrect = (data = {}) => {
    return axiosApiWork({
        method: 'POST',
        data,
        url: `${prefix}/updateCorrect`
    })
}

export const getCountDate = (id = 0) =>{
    return axios({
        method: 'GET',
        url:`/mobile/tasks/sku-date/${id}`
    })
}

export const verifySkuStaff = (params = {}) =>{
    return axios({
        method: 'GET',
        params,
        url:`/hr/task-daily/report-verify-sku-staff`
    })
}

export const getListExportExcel = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url:`/hr/task-daily/report-checkstock`
    })
}
export const updateVerifySku = (params = {}) => { 
    return axios({
        method: 'POST',
        params,
        url:`/mobile/tasks/verify-sku`
    })
}