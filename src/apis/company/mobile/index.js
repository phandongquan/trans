import axios from '~/utils/request';

const prefix = '/mobile';

export const getDistrictByCity = (params) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/staff/load-district-by-city`
    })
}

export const getWardByDistrict = (params) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/staff/load-ward-by-district`
    })
}

export default {
    getDistrictByCity,
    getWardByDistrict
}