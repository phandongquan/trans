export const SEARCH_STORE = {
    REQUEST: 'API_SEARCH_STORE_REQUEST',
    SUCCESS: 'API_SEARCH_STORE_SUCCESS',
    ERROR: 'API_SEARCH_STORE_ERROR',
};

export default function(keyword, limit, ids){
    return{
        type: SEARCH_STORE.REQUEST,
        keyword, limit, ids
    }
}