import {
    SEARCH_STAFF
} from './actions'

const initialState = {
    data: [],
    loading: false
}

function reducer(state = initialState, action) {
    switch (action.type) {
        case SEARCH_STAFF.REQUEST:
            return {
                ...state,
                loading: true,
                data: [],
            }
        case SEARCH_STAFF.SUCCESS:
            return {
                ...state,
                loading: false,
                data: action.data.rows.map(row=>({...row, value: row.staff_id, label: row.staff_name})),
            }
        case SEARCH_STAFF.ERROR:
            return {
                ...state,
                loading: false,
            }
        default:
            return state
    }
}

export default reducer