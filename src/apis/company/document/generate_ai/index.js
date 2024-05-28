import { URL_AI, URL_AI_V2 } from '~/constants';
import axios from '~/utils/request_hr';
const prefix = '/gen-question';
const prefix_pdf_extract = '/pdf_extract';


export const generate = (data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${URL_AI}${prefix}`
    })
}

export const fetchDocument = (data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${URL_AI_V2}${prefix_pdf_extract}`
    })
}

export const trainingChatBot = (data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${URL_AI}${'/update-data-chatbot'}`
    })
}

export default {
    generate,
    trainingChatBot
}