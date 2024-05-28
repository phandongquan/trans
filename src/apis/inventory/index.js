import axios from '~/utils/request'

const prefix = '/inventory';

export const getStockImportExportUnit =(params)=> {
    return axios({
        method: 'GET',
        params,
        url: `${prefix}/stock-import-export-unit`
    })
}
