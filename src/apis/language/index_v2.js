import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';


const prefix = '/hr/language';

export const list = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}`
    })
}

export const update = (id=0, data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/${id}`
    })
}
export const combine = () =>{
    return axios({
        method: 'POST',
        url: `${prefix}/combine`
    })

}
export const create = (data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}
export const importFile = (data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}/import`
    })
}
export const destroy = (id = 0) =>{
    return axios({
        method: 'DELETE',
        url: `${prefix}/${id}`
    })
}