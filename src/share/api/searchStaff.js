import axios from '~/utils/axios_inside'

export default (keyword, limit, ids)=> {
    console.log('idsidsids', ids)
    return axios.get(`/hr/staff?sort=staff_id${limit ? '&limit='+limit : ''}&offset=0${typeof keyword === 'string' ? '&q='+keyword : ''}${ids ? '&ids='+ids.join() : ''}`)
}

