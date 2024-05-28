import { BASE } from '~/redux/actions/base';

const initialState = {
    locations: [],
    departments: [],
    divisions: [],
    majors: [],
    positions: [],
    cities: [],
    stocks: [],
    brands : []
}

function baseData(state = initialState, action) {
    switch (action.type) {
        case BASE.success:
            return {
                ...state,
                locations: action.locations,
                departments: action.departments,
                divisions: action.divisions,
                majors: action.majors,
                positions: action.positions,
                cities: action.cities,
                stocks: action.stocks,
                brands : action.brands
            };
        case BASE.error:
            return {
                ...state,
                ...initialState
            };
        default:
            return state
    }
}

export default baseData;