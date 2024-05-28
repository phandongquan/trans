import axios from '~/utils/request_hr';
const prefix_document = 'hr/document-draft';

export  const getDocumentDraft = (params) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix_document}`  
    })
}
export default {
    getDocumentDraft
}