import axios from '~/utils/axios_inside'

export default (keyword, limit, ids)=> {
    return axios.get(`/sales/product/search?product_status=1${limit ? '&limit='+limit : ''}&offset=0${typeof keyword === 'string' ? '&q='+keyword : ''}${ids ? '&ids='+ids.join() : ''}`)
}

