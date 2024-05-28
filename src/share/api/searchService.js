import axios from '~/utils/axios_inside'

export default (keyword, limit, ids)=> {
    return axios.get(`/spa/service/search?status=1&sort=service_id&is_group_id=1${limit ? '&limit='+limit : ''}&offset=0${typeof keyword === 'string' ? '&q='+keyword : ''}${ids ? '&ids='+ids.join() : ''}`)
}

