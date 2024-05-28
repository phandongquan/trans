import axios from '~/utils/request_hr';

const prefix = '/hr/manage-electric/interrupts';


export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}`
    })
}
export const updateSolution = (id = 0 ,data = {}) => {
    return axios({
        method: 'POST',
        data ,
        url: `/hr/manage-electric/interrupt/${id}`
    })
}