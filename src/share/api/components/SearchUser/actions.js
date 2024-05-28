export const SEARCH_USER = {
    REQUEST: 'API_SEARCH_USER_REQUEST',
    SUCCESS: 'API_SEARCH_USER_SUCCESS',
    ERROR: 'API_SEARCH_USER_ERROR',
};

export default function(keyword, limit, ids){
    return{
        type: SEARCH_USER.REQUEST,
        keyword, limit, ids
    }
}