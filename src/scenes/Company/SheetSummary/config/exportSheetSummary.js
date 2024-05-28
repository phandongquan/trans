import store from '~/redux/store';
import {staffStatus, WorkType} from '~/constants/basic';
import dayjs from 'dayjs';


/**
 * XLS file header
 */
export const header = {
    'staff_dept_id': 'Department',
    'division_id': 'Section',
    'major_id': 'Major',
    'staff_loc_id': 'Location',
    'position_id': 'Position',
    'staff_name': 'Staff',
    'staff_id': 'Staff Id',
    'staff_code': 'Code',
    'staff_email': 'Email',
    'staff_status': 'Status',
    'staff_hire_date': 'Hire date(wm)',
    'work_type':'Work type',
    'sum_confirm_hours': 'Sum Số giờ xác nhận',
    'sum_task_wf': 'Sum xác nhận WF',
    'sum_task_suggest': 'Sum xác nhận Task Suggest',
    'count_task': 'Số task được giao',
    'count_status': 'Số task hoàn thành',
    'count_task_pending': 'Task Pending',
    'count_task_lated': 'Task Lated',
    'working_day': 'Số ngày công',
    'working_time': 'Số giờ làm việc chuẩn',
    'working_time_company': 'Số giờ LV tại công ty',
    'days_off_a': 'Nghỉ phép năm',
    'days_off_w': 'Nghỉ off tuần',
    'days_off_c': 'Nghỉ không lương',
    'days_off_r': 'Nghỉ chế độ',
    'days_work': 'Số ngày tới công ty',
    'sum_time_diff': 'Số giờ bù công',
    'kpi': 'Hoàn thành (%)',
    'vuot_muc': 'Vượt mức (%)',
    'skill_revenue': 'Skill Bonus (VND)',
    'annual_remaining': 'Phép năm',
    'hour_total_kpi': 'Total KPIs (h)'
}

export function formatHeaders(kpiGroups) {
    let headerFormat = [];
    Object.keys(header).map((key) => {
        headerFormat.push(header[key]);
    });

    kpiGroups.map(k => {
        headerFormat.push(k.criterion + ' - ' + k.code);
    })
    return headerFormat;
}

/**
 * Format data from header
 */
export function formatSheetSummary(sheetSummaries, kpiGroups) {
    let { baseData: { departments, divisions , majors, locations, positions } } = store.getState();

    let headerFormat = header;
    kpiGroups.map(k => {
        headerFormat[k.code] = k.criterion + ' - ' + k.code;
    })

    let data = [];
    sheetSummaries.map((record, i) => {
        let exportData = [];
        Object.keys(headerFormat).map(key => {
            if (typeof record[key] !== 'undefined') {
                exportData.push(record[key] ? record[key] : 0);
            } else {
                switch (key) {
                    case 'staff_dept_id':
                        exportData.push(record.staff ? departments.find(d => d.id == record.staff.staff_dept_id)?.name : '');
                        break;
                    case 'major_id':
                        exportData.push(record.staff ? majors.find(d => d.id == record.staff.major_id)?.name : '');
                        break;
                    case 'staff_loc_id':
                        exportData.push(record.staff ? locations.find(l => l.id == record.staff.staff_loc_id)?.name : '');
                    break;
                    case 'position_id':
                        exportData.push(record.staff ? positions.find(p => p.id == record.staff.position_id)?.name : '');
                    break;
                    case 'division_id':
                        exportData.push(record.staff ? divisions.find(d => d.id == record.staff.division_id)?.name : '');
                        break;
                    case 'staff_name':
                        exportData.push(record.staff ? record.staff.staff_name : '');
                        break;
                    case 'staff_code':
                        exportData.push(record.staff ? record.staff.code : '');
                        break;
                    case 'staff_id':
                        exportData.push(record.staff ? record.staff.staff_id: '');
                        break;
                    case 'staff_email':
                        exportData.push(record.staff ? record.staff.staff_email: '');
                        break;
                    case 'staff_status':
                        exportData.push(record.staff ? record.staff.staff_status && staffStatus[ record.staff.staff_status]: '');
                        break;
                    case 'staff_hire_date':
                        exportData.push(
                            record.staff && record.staff.staff_hire_date 
                                ? dayjs().diff(dayjs(record.staff.staff_hire_date * 1000), 'months', true).toFixed(1) 
                                : ''
                        );
                        break;
                    case 'work_type':
                        exportData.push(record.staff ? WorkType[record.staff.work_type]: '');
                        break;
                    case 'hoan_thanh':
                        let percentFinish = 0;
                        let sum_confirm_hoursFinish = record.sum_confirm_hours ? Number(record.sum_confirm_hours) : 0;
                        if(sum_confirm_hoursFinish && record.working_time) {
                            percentFinish = (sum_confirm_hoursFinish * 100)/record.working_time.toFixed(2)
                        }
                        exportData.push(percentFinish > 100 ? 100 : percentFinish);
                        break;
                    case 'vuot_muc':
                        let percent = 0;
                        let sum_confirm_hours = record.sum_confirm_hours ? Number(record.sum_confirm_hours) : 0;
                        if(sum_confirm_hours && record.working_time) {
                            percent = (sum_confirm_hours * 100)/record.working_time.toFixed(2)
                        }
                        exportData.push(percent > 100 ? percent - 100 : 0);
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

export default {
    header,
    formatSheetSummary
}