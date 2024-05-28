import axios, { CancelToken } from "axios";
import Cookies from "js-cookie";
import { CANCEL } from "redux-saga";
import { WS_HR } from "~/constants";
import store from "~/redux/store";

const instance = axios.create({
    baseURL: WS_HR,
    timeout: 120000,
    // transformRequest: [(data) => JSON.stringify(data)],
    // headers: {
    //   'Accept': 'application/json',
    //   'Content-Type': 'application/json',
    // },
    validateStatus: (status) => {
        return true; // I'm always returning true, you may want to do it depending on the status received
    },
});
instance.interceptors.request.use(
    function (config) {
        // Do something before request is sent
        let token = localStorage.getItem("client_hasaki_inside_token");
        // const token = Cookies.get('ws_token');
        if (token) {
            config.headers.common["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

// remove field null
const clean = (obj) => {
    const isBlob = obj instanceof Blob ? true : false;
    const isFormData = obj instanceof FormData ? true : false;
    const isArray = obj instanceof Array ? true : false;
    if (!obj || isFormData || isBlob || isArray) {
        return obj;
    }

    let data = { ...obj };
    for (var propName in data) {
        if (data[propName] === null || data[propName] === undefined) {
            delete data[propName];
        }
    }
    return JSON.stringify(data) === "{}" ? null : data;
};
export default (options) => {
    const data = clean(options.data);
    const params = clean(options.params);
    const source = CancelToken.source();
    const promise = new Promise((resolve, reject) => {
        instance({
            ...options,
            data,
            params,
            cancelToken: source.token,
        })
            .then((response) => {
                if (
                    response.status === 401 ||
                    response.data.message === "Token has expired"
                ) {
                    store.dispatch({
                        type: "AUTH_LOGOUT_REQUEST",
                    });
                }
                resolve(response.data);
            })
            .catch((error) => {
                throw error;
            });
    });
    promise[CANCEL] = () => source.cancel();
    return promise;
};
