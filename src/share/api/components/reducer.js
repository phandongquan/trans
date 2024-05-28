import { combineReducers } from 'redux'
import search_group from './SearchGroup/reducer'
import search_service from './SearchService/reducer'
import search_staff from './SearchStaff/reducer'
import search_store from './SearchStore/reducer'
import search_user from './SearchUser/reducer'
import store from './Store/reducer'
import company_file from './TableCompanyFile/reducer'

const reducer = combineReducers({
    search_group,
    search_service,
    search_staff,
    search_store,
    search_user,
    store,
    company_file,
})

export default reducer