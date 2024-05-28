import store from '~/redux/store';
import { convertToSingleObject } from '~/services/helper';

export const header = {
    'code': 'Staff Code',
    'staff_name': 'Staff Name',
    'position_id': 'Position',
    'staff_dept_id': 'Department',
    'major_id': 'Major',
    'division_id': 'Division',
    'staff_loc_id': 'Location',
    'skill_revenue': 'Bonus (VND)'
}

export function getHeader() {
    let result = [];
    Object.keys(header).map(key => {
        result.push(header[key]);
    });
    return [result];
}

/**
 * List key need to convert to text
 */
let convertKeyToText = {
    'staff_dept_id': 'departments',
    'division_id': 'divisions',
    'position_id': 'positions',
    'major_id': 'majors',
    'staff_loc_id': 'locations',
};

export function formatData(data) {
    let { baseData } = store.getState();
    let baseFormat = {};
    Object.keys(baseData).map(key => {
        baseFormat[key] = convertToSingleObject(baseData[key]);
    });
    let result = [];
    data.map(d => {
        let row = [];
        Object.keys(header).map(key => {
            if (convertKeyToText[key]) {
                let text = (d[key] != 0 && typeof baseFormat[convertKeyToText[key]][d[key]] !== 'undefined') ? baseFormat[convertKeyToText[key]][d[key]] : '';
                row.push(text);
            } else {
                row.push(d[key]);
            }
        });
        result.push(row);
    })

    return [...result];
} 