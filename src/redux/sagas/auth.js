import { takeLatest, call, put, all } from 'redux-saga/effects';

import { AUTH } from '~/redux/actions/auth';
import { HR_LANGUAGE_KEY } from '~/constants/basic';
import { ipPublic as getIPPublic, profile as userProfile } from '~/apis/setting/user';
import { login as loginApi } from '~/apis/setting/auth';

import { BASE } from '~/redux/actions/base';
import { getData } from '~/apis/setting/base';
import i18n from 'i18next';
const keyStorageChecksum = 'checksum_base_data';
/**
 * Verify token
 */
function* verifySaga() {
    try {

        // set token from inside on url
        const tokenFromInside = window.location.search.split('token=')[1];
        if (tokenFromInside) {
            localStorage.setItem('client_hasaki_inside_token', tokenFromInside)
        }

        const token = localStorage.getItem('client_hasaki_inside_token');
        // const token = Cookies.get('ws_token');
        // const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEwMTMsImlzcyI6Imh0dHA6Ly93cy5oYXNha2kubG9jYWwvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2MDE5NDc3MjYsImV4cCI6MTYyODIyNzcyNiwibmJmIjoxNjAxOTQ3NzI2LCJqdGkiOiJBTWV4anF4UktWOTJyUHNlIn0.2wailKFBXNDmWIoqpozieQomygtmsPzYGTf4xVo0DN0';
        // Cookies.set('ws_token', token);
        if (token) {
            const response = yield call(userProfile)
            if (response.status && response.data?.profile) {
                let { data: { profile, permission, auth_permission, staff_info } } = response
                profile.ip_allow = true
                let stores = [];
                // let stores_allow = profile.stores.map(item=>({...item, label: item.store_id, value: item.store_id,}))
                // let store = null
                let stores_writable = []
                let stores_read_only = []
                // const responseAssignStore = yield call(getAssignStoreAPI)
                // if(responseAssignStore.status === 1){
                //   stores = responseAssignStore.data.rows


                for (let index = 0; index < profile.stores.length; index++) {
                    if (profile.stores[index].status & 1) {
                        stores_writable.push(profile.stores[index])
                    } else if (profile.stores[index].status & 2) {
                        stores_read_only.push(profile.stores[index])
                    }
                }
                // }
                if (profile.role_id !== 130) { // SUPPER ADMIN
                    profile.stores = stores_writable.concat(stores_read_only)
                }

                // Setup multi language
                const locale = profile?.locale || 'en';
                const currentLocale = localStorage.getItem(HR_LANGUAGE_KEY);
                if (!currentLocale || locale != currentLocale) {
                    localStorage.setItem(HR_LANGUAGE_KEY, locale)
                    i18n.changeLanguage(locale);
                }
                /*
                const responseStores = yield call(getListStore, {
                    status: null,
                    service_id: null,
                })
                if (responseStores.status) {
                    stores = responseStores.data.rows.map(item => ({
                        ...item,
                        value: item.store_id,
                        label: item.store_name,
                        properties: item.properties && item.properties != 'NULL' ? JSON.parse(item.properties) : null
                    }))
                    profile.store = stores.find(item => item.store_id === profile.store_id)
                    profile.stores = profile.stores.map(store => {
                        const store_info = stores.find(item => store.store_id === item.store_id)
                        if (store_info) {
                            return {
                                ...store,
                                value: store_info.store_id,
                                label: store_info.store_name,
                            }
                        }
                        return {
                            ...store,
                            label: store.store_id,
                            value: store.store_id,
                        }
                    })
                }
                */

                /**
                 * @get IpPublic
                 */
                // const responseIPPublic = yield call(getIPPublic, {
                //     limit: 1000
                // })
                // if (responseIPPublic.status) {
                //     profile.ip = responseIPPublic.data.ip
                //     const arr_ip_allow = profile.store?.properties?.ip
                //     if (arr_ip_allow && arr_ip_allow.length > 0 && arr_ip_allow.indexOf(profile.ip) == -1) {
                //         profile.ip_allow = false
                //     }
                // }

                /**
                 * Get Base data
                 */
                const checksum = localStorage.getItem(keyStorageChecksum);
                const responseBaseData = yield call(getData, { checksum });
                if (responseBaseData.status && responseBaseData.data) {
                    let baseData = responseBaseData.data;
                    let baseDataCache = yield call(storeBasedata, baseData);
                    yield put({ type: BASE.success, ...baseDataCache });
                } else {
                    yield put({ type: BASE.error, error: responseBaseData });
                }
                yield put({ type: AUTH.verify.success, profile, permission: [...permission, ...auth_permission], staff_info, stores, stores_writable, stores_read_only });

            } else {
                yield put({ type: AUTH.verify.error, error: response });
            }
        } else {
            yield put({ type: AUTH.verify.error });
        }
    } catch (error) {
        yield put({ type: AUTH.verify.error, error });
    }
}

/**
 * Login action
 */
function* login(action) {
    try {
        const { data } = action;
        data['get-permission'] = 1;
        const response = yield call(loginApi, data);
        if (response.status) {
            const { data: { user_id, token } } = response;
            localStorage.setItem('client_hasaki_inside_token', token);
            yield all([
                put({ type: AUTH.login.success, user_id, token }),
            ])
        } else {
            yield put({ type: AUTH.login.error, error: response })
        }
    } catch (error) {
        console.log('error', error)
        yield all([
            put({ type: AUTH.login.error, error })
        ])
    }
}

function* watcher() {
    yield all([
        takeLatest(AUTH.verify.request, verifySaga),
        takeLatest(AUTH.login.success, verifySaga),
        takeLatest(AUTH.login.request, login)
    ])
}

/**
 * Store base data to AsyncStorage with unique checksum
 * 
 * @param {object} data
 *
 * @return object
 */
function storeBasedata(data = {}) {
    let baseData = {};
    let baseDataCache = localStorage.getItem('base-data');
    try {
        if (data && data.checksum && data.checksum == true && baseDataCache) {
            baseData = JSON.parse(baseDataCache);
        } else {
            baseData = data;
            localStorage.setItem(keyStorageChecksum, String(baseData.checksum));
            localStorage.setItem('base-data', JSON.stringify(baseData));
        }
    } catch (error) {
        console.log('AsyncStorage error during data store:', error);
    }

    return baseData;
}

export default function* () {
    yield all([
        watcher()
    ])
}