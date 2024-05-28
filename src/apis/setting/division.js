import axios from '~/utils/request_hr'

export const getDivisionByDept = (id) => {
    return axios({
        method: 'GET',
        url: `/hr/staff/division-by-dept/${id}`
    })
}
