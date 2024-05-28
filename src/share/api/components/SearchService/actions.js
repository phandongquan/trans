export const SEARCH_SERVICE = {
    REQUEST: 'API_SEARCH_SERVICE_REQUEST',
    SUCCESS: 'API_SEARCH_SERVICE_SUCCESS',
    ERROR: 'API_SEARCH_SERVICE_ERROR',
};

export default function(keyword, limit, ids){
    return{
        type: SEARCH_SERVICE.REQUEST,
        keyword, limit, ids
    }
}