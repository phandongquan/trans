import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';

const prefix_document = '/hr/document';
const prefix_notification = '/mobile/staff/send-notify';

export const getDocument = (params = {}) => {
    return axios({
        method: 'GET',
        params: {
            ...params
        },
        url: `${prefix_document}`
    })
}

export const getDocumentDetail = (ID) => {
    return axios({
        method: 'GET',
        url: `${prefix_document}/` + ID
    })
}

export const createDocument = (data) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix_document}`
    })
}

export const updateDocument = (id, data) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix_document}/` + id
    })
}

export const deleteDocument = (id) => {
    return axios({
        method: 'DELETE',
        url: `${prefix_document}/` + id
    })
}

export const pushNotification = (data) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix_notification}`
    })
}

export const getCounterView = (params) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix_document}/counter-view`
    })
}

export const approvedChapter = (params) => {
    return axios({
        method: 'POST',
        params,
        url: `${prefix_document}/approved-chapter`
    })
}
export const sendNotify = (data = {}) => {
    return axios ({
        method : 'POST',
        data,
        url:`${prefix_document}/send-notify`

    })
}
 export const createComunication = (id, params = {}) => {
   return axios({
     method: "POST",
     params: {
       ...params,
     },
     url: `${prefix_document}/${id}/sync-comm`,
   });
 };

export default {
  getDocument,
  getDocumentDetail,
  createDocument,
  updateDocument,
  deleteDocument,
  pushNotification,
  sendNotify,
  createComunication,
};