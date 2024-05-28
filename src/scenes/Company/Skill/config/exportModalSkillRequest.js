import dayjs from 'dayjs';
import { subTypeRangeUsers, typeRangeUsers } from '~/constants/basic';
import store from '~/redux/store';
const header = {
    code: 'Staff Code',
    staff_name: 'Staff Name',
    staff_dept_id: 'Department',
    major_id: 'Major',
    staff_loc_id: 'Location',
    position_id: 'Position',
    staff_hire_date : 'Thời gian làm việc (tháng)' ,
    skill : 'Skill Name',
    level : 'Level hiện tại',
    date : 'Ngày cập nhật level ',
    type : 'Phương thức thực hiện',
    deadline: 'Deadline',
}

export function formatHeader() {
    let headerFormat = [];
    Object.keys(header).map((key, i) => {
        headerFormat.push(header[key]); 
    });
    return [headerFormat];
}
export function formatData(datas,deadline,rangeUser , skillName = '') {
    let { baseData: { departments, majors, locations , positions } } = store.getState();
    let result = [];
    datas.map((record, index) => {
        let rows = [];
        Object.keys(header).map((key, indexKey) => {
            switch (key) {
                case 'staff_dept_id':
                    rows.push(departments.find(d => d.id == record[key]) ? departments.find(d => d.id == record[key])?.name : '');
                    break;
                case 'major_id':
                    rows.push(majors.find(m => m.id == record[key]) ? majors.find(m => m.id == record[key])?.name : '');
                    break;
                case 'staff_loc_id':
                    rows.push(locations.find(l => l.id == record[key]) ? locations.find(l => l.id == record[key])?.name : '');
                    break;
                case 'position_id':
                    rows.push(positions.find(p => p.id == record[key]) ? positions.find(p => p.id == record[key])?.name : '');
                    break;
                case 'deadline':
                    rows.push(deadline);
                    break;
                case 'type':
                    rows.push(subTypeRangeUsers[rangeUser])
                    break;
                case 'staff_hire_date':
                    rows.push(record[key] ? dayjs().diff(dayjs(record[key] * 1000), 'months', true).toFixed(1) : '')
                    break;
                case 'skill':
                    rows.push(skillName);
                    break;
                default:
                    rows.push(record[key] ? record[key] : '');
                    break;
            }
        })
        result.push(rows)
    })
    return result;

}