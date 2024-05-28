export const actionType = {
    LIST: {
        REQUEST: 'API.GROUP.LIST.REQUEST',
        SUCCESS: 'API.GROUP.LIST.SUCCESS',
        ERROR: 'API.GROUP.LIST.ERROR',
    }
};

export default function(params){
    return{
        type: actionType.LIST.REQUEST,
        params
    }
}