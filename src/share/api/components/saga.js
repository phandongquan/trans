import { all } from 'redux-saga/effects'
import searchGroup from './SearchGroup/saga'
import searchService from './SearchService/saga'
import searchStaff from './SearchStaff/saga'
import searchStore from './SearchStore/saga'
import searchUser from './SearchUser/saga'
import storeSaga from './Store/saga'
import tableCompanyFileSaga from './TableCompanyFile/saga'

export default function* () {
    yield all([
        searchGroup(),
        searchService(),
        searchStaff(),
        searchStore(),
        searchUser(),
        storeSaga(),
        tableCompanyFileSaga(),
    ])
}