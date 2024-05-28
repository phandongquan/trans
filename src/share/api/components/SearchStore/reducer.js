import {
    SEARCH_STORE
} from './actions'

const initialState = {
    data: [],
    data_obj: {},
    loading: false
}

function reducer(state = initialState, action) {
    switch (action.type) {
        case SEARCH_STORE.REQUEST:
            return {
                ...state,
                loading: true,
                data: [],
                data_obj: {},
            }
        case SEARCH_STORE.SUCCESS:
            let data_obj = {
                ...state.data_obj
            }
            const data = action.data.rows.map(row=>{
                data_obj[row.store_id] = row;
                return {...row, value: row.store_id, label: row.store_name}
            })
            return {
                ...state,
                loading: false,
                data,
                data_obj,
            }
        case SEARCH_STORE.ERROR:
            return {
                ...state,
                loading: false,
            }
        default:
            return state
    }
}

export default reducer