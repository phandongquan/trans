import axios from '~/utils/axios_inside'

export default (keyword, limit, ids)=> {
    return axios.get(`/setting/user?sort=id${limit ? '&limit='+limit : ''}&offset=0${typeof keyword === 'string' ? '&q='+keyword : ''}${ids ? '&ids='+ids.join() : ''}`)
}

