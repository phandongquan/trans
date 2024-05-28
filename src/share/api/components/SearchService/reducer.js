import {
    SEARCH_SERVICE
} from './actions'

const initialState = {
    data: [],
    loading: false
}

function reducer(state = initialState, action) {
    switch (action.type) {
        case SEARCH_SERVICE.REQUEST:
            return {
                ...state,
                loading: true,
                data: [],
            }
        case SEARCH_SERVICE.SUCCESS:
            return {
                ...state,
                loading: false,
                data: action.data.rows.map(row=>({...row, value: row.service_sku, label: row.service_name})),
            }
        case SEARCH_SERVICE.ERROR:
            return {
                ...state,
                loading: false,
            }
        default:
            return state
    }
}

export default reducer