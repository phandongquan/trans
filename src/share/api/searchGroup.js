import axios from '~/utils/axios_inside'

export default (keyword, limit, ids)=> {
    return axios.get(`/spa/servicegroup/search?sort=service_group_id${limit ? '&limit='+limit : ''}&offset=0${typeof keyword === 'string' ? '&q='+keyword : ''}${ids ? '&ids='+ids.join() : ''}`)
}

