import {
    actionType as TYPE
} from './actions'

const initialState = {
    data: {
        loading: false,
        links: [],
    },
}

function reducer(state = initialState, action) {
    switch (action.type) {
        case TYPE.REQUEST:
            return {
                ...state,
                data: {
                    ...initialState.data,
                    loading: true,
                }
            }
        case TYPE.SUCCESS:
            return {
                ...state,
                data: {
                    links: action.links,
                    loading: false,
                }
            }
        case TYPE.ERROR:
            return {
                ...state,
                data: {
                    ...state.data,
                    loading: false,
                }
            }

        default:
            return state
    }
}

export default reducer