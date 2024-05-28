import axios, { CancelToken } from 'axios';
import Cookies from 'js-cookie';
import { CANCEL } from 'redux-saga'

const instance = axios.create({
  baseURL: 'https://ai.hasaki.vn',
  timeout: 50000,
  // transformRequest: [(data) => JSON.stringify(data)],
  // headers: {
  //   'Accept': 'application/json',
  //   'Content-Type': 'application/json',
  // },
  validateStatus: (status) => {
    return true; // I'm always returning true, you may want to do it depending on the status received
  },
});
instance.interceptors.request.use(function (config) {
  // Do something before request is sent
  const token = localStorage.getItem('client_hasaki_inside_token');  
  if (token) {
    config.headers.common['Authorization'] = `Bearer ${token}`;
  }
  // config.headers.common['Access-Control-Allow-Origin'] = '*';
  // config.headers.common['Access-Control-Allow-Methods'] = 'GET,HEAD,OPTIONS,POST,PUT';  
  // config.headers.common['Access-Control-Allow-Credentials'] = 'true';
  // config.headers.common['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type';
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// remove field null
const clean = (obj) => {
  if (!obj) {
    return obj
  }
  let data = { ...obj }
  for (var propName in data) {
    if (data[propName] === null || data[propName] === undefined) {
      delete data[propName];
    }
  }
  return JSON.stringify(data) === '{}' ? null : data
}
export default (options) => {
  const data = clean(options.data);
  const params = clean(options.params);
  const source = CancelToken.source();
  const promise = new Promise((resolve, reject) => {
    instance({
      ...options,
      data,
      params,
      cancelToken: source.token
    })
      .then(response => resolve(response.data))
      .catch(error => { throw error })
  })
  promise[CANCEL] = () => source.cancel();
  return promise
}