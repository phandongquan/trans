import axios from '~/utils/request_hr';
import formData from '~/utils/formData_hr'; 
const prefix = "/mobile/medias/publish";

export const generateLink = (data = {}) => {
    return formData({
        method: 'POST',
        data,
        url: `${prefix}`
    })
}
export default {
    generateLink
}

