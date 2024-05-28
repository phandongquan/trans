import store from '~/redux/store';
import { parseIntegertoTime } from '~/services/helper';
export const header = {
    // 'value': 'Date / Time',
    // 'location_id': 'Location',
    // 'count': 'Count'
    'name' : 'Group name',
    'member_count' : 'Member count',
    'created_at' : 'Created at',
    'created_by_name' : 'Created by',
    'description' : 'Description'
}

export function formatHeader() {
    let headers = [] 
    Object.keys(header).map((key, i) => {
        headers.push(header[key]);
    });
    return [headers];
}
export function formatData(datas) {
    let result = [];

    datas.map(d => {
        let row = []
        Object.keys(header).map(key => {
            switch(key) {
                case 'created_at':
                    row.push(parseIntegertoTime(d[key] , 'DD-MM-YYYY'))
                    break;
                default:
                    row.push(d[key]);
                    break;
            }
        })
        result.push(row)
    })
    return result;
}