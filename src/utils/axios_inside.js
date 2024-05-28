import axios from 'axios'
import { WS_API } from '~/constants'

const instance = axios.create({
  baseURL: WS_API,
  timeout: 20000,
  validateStatus: (status) => {
    return true; // I'm always returning true, you may want to do it depending on the status received
  },
});
instance.interceptors.request.use(function (config) {
  config.headers.common['Authorization'] = `Bearer ${localStorage.getItem('client_hasaki_inside_token')}`;
  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});
export default instance;