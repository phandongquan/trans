import {
    SEARCH_USER
} from './actions'

const initialState = {
    data: [],
    loading: false
}

function reducer(state = initialState, action) {
    switch (action.type) {
        case SEARCH_USER.REQUEST:
            return {
                ...state,
                loading: true,
                data: [],
            }
        case SEARCH_USER.SUCCESS:
            return {
                ...state,
                loading: false,
                data: action.data.rows.map(row=>({...row, value: row.id, label: row.name})),
            }
        case SEARCH_USER.ERROR:
            return {
                ...state,
                loading: false,
            }
        default:
            return state
    }
}

export default reducer