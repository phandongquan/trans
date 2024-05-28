import { endPoints } from './fileProcess/const'
import axios from '~/utils/request_hr'

export const uploadFile = (data = {}) => {
    const {
        chunk,
        chunk_number,
        total_chunk,
        file_number,
        file_name,
        retry,
        retry_is_last,
    } = data;

    return axios({
        method: 'POST',
        url: endPoints.uploadChunk,
        params: {
            chunk_number,
            total_chunk,
            file_number,
            file_name,
            retry,
            retry_is_last,
        },
        data: chunk,
        headers: {
            "Content-Type": "text/plain",
        },
    })
};

export const uploadFiles = (fileArray = []) => {
    return axios({
        method: 'POST',
        url: endPoints.uploadForm,
        data: fileArray,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
}