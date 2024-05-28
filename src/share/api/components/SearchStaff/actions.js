export const SEARCH_STAFF = {
    REQUEST: 'API_SEARCH_STAFF_REQUEST',
    SUCCESS: 'API_SEARCH_STAFF_SUCCESS',
    ERROR: 'API_SEARCH_STAFF_ERROR',
};

export default function(keyword, limit, ids){
    return{
        type: SEARCH_STAFF.REQUEST,
        keyword, limit, ids
    }
}