import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr';

const prefix_document = '/hr/document';
export const getDocument = (params = {}) => {
  return axios({
      method: 'GET',
      params: {
          ...params
      },
      url: `${prefix_document}/form`
  })
}
export default {getDocument}
