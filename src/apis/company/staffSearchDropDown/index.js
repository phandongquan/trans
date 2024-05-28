import axios from '~/utils/request_hr'

const prefix = '/news/staff';
export const searchForDropdown = (params = {}) => {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/search-for-dropdown`
    })
}

export const searchForDropdownSkill = (params = {},skill_id = 0) => {
    return axios({
        method: 'GET',
        params,
        url: `/hr/skill-upraise/search-staff?skill_id=${skill_id}`
    })
}
export const findUser = (data = {}) => {
    return axios({
        method: 'POST',
        data,
        url: `${prefix}/find-by-user-ids`
    })
}