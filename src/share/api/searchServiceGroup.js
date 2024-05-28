import axios from '~/utils/request'

export default (keyword, limit, ids)=> {
    return axios({
        method: 'GET',
        url: `/spa/servicegroup/search?status=1&sort=service_id&is_group_id=1${limit ? '&limit='+limit : ''}&offset=0${typeof keyword === 'string' ? '&q='+keyword : ''}${ids ? '&ids='+ids.join() : ''}`
    })
}

