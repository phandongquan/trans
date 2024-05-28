import dayjs from 'dayjs';
import { subTypeRangeUsers, typeRangeUsers } from '~/constants/basic';
import store from '~/redux/store';
const header = {
    staff_name: 'Staff Name',
    code: 'Staff Code',
    staff_dept_id: 'Department',
    major_id: 'Major',
    staff_loc_id: 'Location',
    position_id: 'Position',
    level : 'Skill Level',
    current_level : 'Skill Level update	',
    deadline: 'Deadline',
    sub_type : 'Sub type',
    confirm_at : 'Confirm',
    view_at : 'Viewed',
    exam : 'Examined',
    exam_updated_by_staff : 'Updated by'
}

export function formatHeader() {
    let headerFormat = [];
    Object.keys(header).map((key, i) => {
        headerFormat.push(header[key]); 
    });
    return [headerFormat];
}
export function formatData(datas) {
    let { baseData: { departments, majors, locations , positions } } = store.getState();
    let result = [];
    datas.map((record, index) => {
        let rows = [];
        Object.keys(header).map((key, indexKey) => {
            switch (key) {
                case 'staff_name':
                    if(record?.staff?.staff_name){
                        rows.push(record.staff.staff_name);
                    }else{
                        rows.push('');
                    }
                    break;
                case 'code':
                    rows.push(record?.staff?.code);
                    break;
                case 'staff_dept_id':
                    rows.push(departments.find(d => d.id == record?.staff?.staff_dept_id) ? departments.find(d => d.id == record?.staff?.staff_dept_id)?.name : '');
                    break;
                case 'major_id':
                    rows.push(majors.find(m => m.id == record?.staff?.major_id) ? majors.find(m => m.id == record?.staff?.major_id)?.name : '');
                    break;
                case 'staff_loc_id':
                    rows.push(locations.find(l => l.id == record?.staff?.staff_loc_id ) ? locations.find(l => l.id == record?.staff?.staff_loc_id)?.name : '');
                    break;
                case 'position_id':
                    rows.push(positions.find(p => p.id == record?.staff?.position_id) ? positions.find(p => p.id == record?.staff?.position_id)?.name : '');
                    break;
                case 'sub_type':
                    rows.push(subTypeRangeUsers[record[key]]);
                    break;
                case 'exam':
                    rows.push(record.exam_id ? `https://hr.hasaki.vn/company/training-examination/${record.exam_id}/history` :'');
                    break;
                case 'exam_updated_by_staff':
                    rows.push(record?.exam_updated_by_staff?.staff_name ? record?.exam_updated_by_staff?.staff_name : '');
                    break;
                default:
                    rows.push(record[key]);
                    break;
            }
        })
        result.push(rows)
    })
    return result;

}