export const actionType = {
    REQUEST: 'SHARE.TABLE_COMPANY_FILE.REQUEST',
    SUCCESS: 'SHARE.TABLE_COMPANY_FILE.SUCCESS',
    ERROR: 'SHARE.TABLE_COMPANY_FILE.ERROR',
}
export const getList = (params) =>{
    return {
        type: actionType.REQUEST,
        params
    }
}