import dayjs from 'dayjs';
import { statusSkillRequest, subTypeRangeUsers, typeRangeUsers } from '~/constants/basic';
import store from '~/redux/store';
const header = {
    stt: 'No.',
    created_at: 'Time request',
    deadline: 'Deadline',
    name: 'Skill name',
    type: 'Range users',
    status: 'Status',
    content: 'Content',
    created: 'Created',
    location_id: 'Location',
    department_id: 'Department',
    major_id: 'Major',
    staff_code: 'Staff Code',
    staff_name: 'Staff name',
    level: 'Skill level',
    current_level: 'Skill level updated',
    confirm_at: 'Confirm At',
    deadline_staff: 'Deadline',
    sub_type: 'Sub type',
    viewed: 'Viewed',
    examined: 'Examined',
    updated_by: 'Updated by',


}

export function formatHeader() {
    let headerFormat = [];
    Object.keys(header).map((key, i) => {
        headerFormat.push(header[key]);
    });
    return [headerFormat];
}

export function formatData(datas) {
    let { baseData: { departments, majors, locations } } = store.getState();
    let result = [];
    datas.map((record, index) => {
        let checkExpirated = (dayjs(record.deadline).unix() < dayjs().unix()) && (Number(record.total_staff) > Number(record.total_updated))
        let rows = [];
        Object.keys(header).map((key, indexKey) => {
            if (indexKey < 8) {
                switch (key) {
                    case 'stt':
                        rows.push(datas.indexOf(record) + 1);
                        break;
                    case 'name':
                        rows.push(record?.skill?.name);
                        break;
                    case 'type':
                        rows.push(typeRangeUsers[record.type]);
                        break;
                    case 'status':
                        rows.push(statusSkillRequest[checkExpirated ? 2 : record.status]);
                        break;
                    case 'content':
                        rows.push(record?.data?.notification?.content ? record.data.notification.content : '');
                        break;
                    case 'created':
                        rows.push(`${record?.created_by_user?.staff_name}(${record?.created_by_user?.code})${dayjs(record.created_at).format('DD/MM/YY HH:mm')}`)
                        break;
                    default:
                        rows.push(record[key]);
                        break;
                }
            }
        })
        result.push([...rows]);
        if (record.details.length) {
            (record.details).map(v =>

                result.push([
                    '',
                    record.created_at,
                    record.deadline,
                    record?.skill?.name ? record?.skill?.name : '',
                    typeRangeUsers[record.type],
                    statusSkillRequest[checkExpirated ? 2 : record.status],
                    record?.data?.notification?.content ? record.data.notification.content : '',
                    `${record?.created_by_user?.staff_name}(${record?.created_by_user?.code})${dayjs(record.created_at).format('DD/MM/YY HH:mm')}`,

                    locations.find(l => l.id == v?.staff?.staff_loc_id) ? locations.find(l => l.id == v?.staff?.staff_loc_id).name : '',
                    departments.find(l => l.id == v?.staff?.staff_dept_id) ? departments.find(l => l.id == v?.staff?.staff_dept_id).name : '',
                    majors.find(l => l.id == v?.staff?.major_id) ? majors.find(l => l.id == v?.staff?.major_id).name : '',
                    v.staff ? v.staff.code : '',
                    v.staff ? v.staff.staff_name : '',
                    v.level ? v.level : '',
                    v.current_level ? v.current_level : '',
                    v.confirm_at ? v.confirm_at : '',
                    v.deadline,
                    subTypeRangeUsers[v.sub_type],
                    v.viewed ? v.viewed : '',
                    v.exam ? v.exam.name : '',
                    v?.exam_updated_by_staff?.staff_name ? v?.exam_updated_by_staff?.staff_name : ''
                ])
            )
        }
    })
    return result;
}

const headerStaff = {
    staff_id: 'Staff ID',
    staff_loc_id: 'Location',
    staff_dept_id: 'Department',
    major_id: 'Major',
    code: 'Staff Code',
    staff_name: 'Staff name',
    total: 'Total Skill Required',
    skill_id: 'Skill ID',
    skill_update: 'Total Skill Update',
    skill_not_update: 'Total Skill not update',
}

export function formatHeaderStaff() {
    let headerFormat = [];
    Object.keys(headerStaff).map((key, i) => {
        headerFormat.push(headerStaff[key]);
    });
    return [headerFormat];
}

export function formatDataReportStaff(datas) {
    let { baseData: { departments, majors, locations } } = store.getState();
    let result = [];
    datas.map((record, index) => {
        let rows = [];
        Object.keys(headerStaff).map((key, indexKey) => {
            switch (key) {
                case 'staff_id':
                    rows.push(record.staff_id);
                    break;
                case 'staff_loc_id':
                    rows.push(locations.find(l => l.id == record.staff_loc_id) ? locations.find(l => l.id == record.staff_loc_id).name : '');
                    break;
                case 'staff_dept_id':
                    rows.push(departments.find(l => l.id == record.staff_dept_id) ? departments.find(l => l.id == record.staff_dept_id).name : '');
                    break;
                case 'major_id':
                    rows.push(majors.find(l => l.id == record.major_id) ? majors.find(l => l.id == record.major_id).name : '');
                    break;
                case 'code':
                    rows.push(record.code);
                    break;
                case 'staff_name':
                    rows.push(record.staff_name);
                    break;
                default:
                    rows.push(record[key]);
                    break;
                case 'total':
                    rows.push(record.total);
                    break;
                case 'skill_id':
                    rows.push(record.skill_id ? record.skill_id : '');
                    break;
                case 'skill_update':
                    rows.push(record.skill_update);
                    break;
                case 'skill_not_update':
                    rows.push(record.skill_not_update);
                    break;
            }
        })
        result.push([...rows]);
    })

    return result;
}