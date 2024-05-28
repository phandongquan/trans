export const SEARCH_GROUP = {
    REQUEST: 'API_SEARCH_GROUP_REQUEST',
    SUCCESS: 'API_SEARCH_GROUP_SUCCESS',
    ERROR: 'API_SEARCH_GROUP_ERROR',
};

export default function(keyword, limit, ids){
    return{
        type: SEARCH_GROUP.REQUEST,
        keyword, limit, ids
    }
}