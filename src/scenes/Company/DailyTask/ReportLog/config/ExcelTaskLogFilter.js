import store from '~/redux/store';
import { convertToSingleObject, timeFormatStandard } from '~/services/helper';
import { dateFormat } from '~/constants/basic';

const header = {
    task_name: 'Task',
    staff_name: 'Staff Name',
    staff_code: 'Staff Code',
    department_id: 'Department',
    major_id: 'Major',
    location_id: 'Location',
    created_at: 'Date',
    finished: 'Finished',
    un_finished: 'Un Finished',
    not_done: 'Not Done'
}

export function formatHeader() {
    let headerFormat = [];
    Object.keys(header).map((key, i) => {
        headerFormat.push(header[key]); 
    });
    return [headerFormat];
}

export function formatData(datas = []) {
    let { baseData: { departments, majors, locations } } = store.getState();
    let data = [];
    datas.map(d => {
        let exportData = [];
        Object.keys(header).map(key => {
            switch (key) {
                case 'task_name':
                    exportData.push(d.task?.name);
                    break;
                case 'staff_name':
                    exportData.push(d.staff?.staff_name);
                    break;
                case 'staff_code':
                    exportData.push(d.staff?.code);
                    break;
                case 'created_at':
                    exportData.push(timeFormatStandard(d.created_at, dateFormat));
                    break;
                case 'department_id':
                    exportData.push(departments.find(dept => d.staff?.staff_dept_id == dept.id )?.name);
                    break;
                case 'major_id':
                    exportData.push(majors.find(m => d.staff?.major_id == m.id )?.name);
                    break;
                case 'location_id':
                    exportData.push(locations.find(l => d.staff?.staff_loc_id == l.id )?.name);
                    break;
                case 'finished':
                    exportData.push(d.status == 2 ? 1 : 0);
                    break;
                case 'un_finished':
                    exportData.push(d.status == 1 ? 1 : 0);
                    break;
                case 'not_done':
                    exportData.push(d.status == 0 ? 1 : 0);
                    break;
                default:
                    exportData.push('');
                    break;
            }
        });
        data.push(exportData);
    });
    return data;
}