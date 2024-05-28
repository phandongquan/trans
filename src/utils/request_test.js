import axios, { CancelToken } from 'axios';
import Cookies from 'js-cookie';
import { CANCEL } from 'redux-saga'
import { WS_API } from '~/constants';

const instance = axios.create({
  baseURL: 'https://ws.inshasaki.com/api',
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
  // const token = Cookies.get('ws_token');
  if(token){
    config.headers.common['Authorization'] = `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjMxMDYsImlzcyI6Imh0dHA6Ly93cy5oYXNha2kubG9jYWw6ODA4MC9hcGkvYXV0aC9sb2dpbiIsImlhdCI6MTY1NDU3NDA1NSwiZXhwIjoxNjgwODU0MDU1LCJuYmYiOjE2NTQ1NzQwNTUsImp0aSI6IlZTUUhYV0NybGdPdktoWngifQ.t6FSa6CTfruAHHsYHmaMfzgaZsU6ukWC4B_ivTqdyXI`;
  }
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// remove field null
const clean =(obj)=> {
  if(!obj){
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
export default (options)=> {
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
      .catch(error => { throw error})
  })
  promise[CANCEL] = () => source.cancel();
  return promise
}