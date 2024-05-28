import axios from '~/utils/axios_inside'

export default (keyword, limit, ids)=> {
    return axios.get(`/setting/store/search?status=1&sort=store_id${limit ? '&limit='+limit : ''}&offset=0${typeof keyword === 'string' ? '&q='+keyword : ''}${ids ? '&ids='+ids.join() : ''}`)
}
