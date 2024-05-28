export const actionType = {
    LIST: {
        REQUEST: 'API.STORE.LIST.REQUEST',
        SUCCESS: 'API.STORE.LIST.SUCCESS',
        ERROR: 'API.STORE.LIST.ERROR',
    }
};

export default function(params){
    return{
        type: actionType.LIST.REQUEST,
        params
    }
}