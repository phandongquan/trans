import store from '~/redux/store';
import { convertToSingleObject } from '~/services/helper';

const header = {
    staff_name: 'Staff Name',
    code: 'Staff Code',
    staff_dept_id: 'Department',
    major_id: 'Major',
    staff_loc_id: 'Location',
    finished: 'Finished',
    un_finished: 'Un Finished',
    not_done: 'Not Done',
    total: 'Count Daily Task',
    '!working_day': 'Working Days',
    kpi: 'kpi'
}

/**
 * List key need to convert to text
 */
 let convertKeyToText = {
    'staff_dept_id': 'departments',
    'major_id': 'majors',
    'staff_loc_id': 'locations'
};

export function formatHeader() {
    let headerFormat = [];
    Object.keys(header).map((key, i) => {
        headerFormat.push(header[key]); 
    });
    return [headerFormat];
}

export function formatData(datas = [], workingDays = []) {
    let { baseData } = store.getState();
    let baseFormat = {};
    Object.keys(baseData).map(key => {
        baseFormat[key] = convertToSingleObject(baseData[key]);
    });

    let data = [];
    datas.map(d => {
        let exportData = [];
        Object.keys(header).map(key => {
            if (typeof d[key] !== 'undefined') {
                if (convertKeyToText[key]) {
                    let text = (d[key] != 0 && typeof baseFormat[convertKeyToText[key]][d[key]] !== 'undefined') ? baseFormat[convertKeyToText[key]][d[key]] : '';
                    exportData.push(text);
                } else {
                    exportData.push(d[key]);
                }

            } else {
                switch (key) {
                    case '!working_day':
                        exportData.push(workingDays[d.staff_id]);
                        break;
                    default:
                        exportData.push('');
                        break;
                }
            }
        });
        data.push(exportData);
    });
    return data;
}