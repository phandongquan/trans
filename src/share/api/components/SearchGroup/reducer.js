import {
    SEARCH_GROUP
} from './actions'

const initialState = {
    data: [],
    loading: false
}

function reducer(state = initialState, action) {
    switch (action.type) {
        case SEARCH_GROUP.REQUEST:
            return {
                ...state,
                loading: true,
                data: [],
            }
        case SEARCH_GROUP.SUCCESS:
            return {
                ...state,
                loading: false,
                data: action.data.rows.map(row=>({...row, value: row.service_group_id+"", label: row.service_group_name})),
            }
        case SEARCH_GROUP.ERROR:
            return {
                ...state,
                loading: false,
            }
        default:
            return state
    }
}

export default reducer