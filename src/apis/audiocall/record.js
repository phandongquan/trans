import axios from '~/utils/request_ai'
import { URL_AI_HR } from '~/constants';
import formData_Ai from '~/utils/formData_Ai';

const prefix = '/control';

export const getList = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix}/getTextAudioData`
    })
}
export const uploadAudio = (params = {} ,data ={}) =>{
    return formData_Ai({
        method : 'POST',
        params,
        data ,
        url : `${prefix}/uploadUrlAudio`
    })
}