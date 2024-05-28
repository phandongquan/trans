import dayjs from 'dayjs';
import store from '~/redux/store';
import { dateFormat,  optionsSequences, scheduleStatus ,taskRequireOptions, typeTaskSchedule } from '~/constants/basic';
import {  timeFormatStandard } from '~/services/helper';
import { SEQUENCES_MONTHLY, SEQUENCES_WEEKLY, getMonthOptions, getDateOptions, getDayOptions, getValuesFromArrayObj } from './TaskScheduleConfig';

let typeSub_type = { 0: "Làm việc nhóm", 1: "Mỗi thành viên đều phải làm" }

const monthOptions = getMonthOptions();
const allValueMonthOptions = getValuesFromArrayObj(monthOptions);
const dayOptions = getDayOptions();
const allValueDayOptions = getValuesFromArrayObj(dayOptions);
const dateOptions = getDateOptions(); // date in week
const allValueDateOptions = getValuesFromArrayObj(dateOptions);


const header = {
    stt: 'No.',
    code : 'Mã công việc',
    name: 'Tên công việc',
    type : 'Type',
    require_media : 'Tùy chọn kết quả công việc',
    sequences : 'Trình tự',
    month : 'Hàng tháng',
    day : 'Hàng ngày',
    date : 'Hàng tuần',
    time : 'Thời gian tạo',
    time_deadline : 'Time Deadline',
    status : 'Trạng thái',
    planned_hours : 'Giờ dự kiến',
    sub_type : 'Làm việc nhóm',

    prid : 'Nhóm công việc',
    deadline_cal_num : 'Số ngày tính late',
    note : 'Ghi chú',
    assign_staff : 'Giao cho',
    report_to : 'CC',
    skill_id : 'Skill',
    dept_ids : 'Giao cho Nhân viên theo Department',
    major_ids : 'Giao cho Nhân viên theo Major',
    position_ids : 'Giao cho Nhân viên theo Position',
    isExcluded : 'Loại trừ các chi nhánh đã chọn',
    locations_ids : 'Giao cho Nhân viên theo Location',
    major_approve_ids : 'Task được duyệt bởi nhân viên theo Major' , 
    staff_approve : 'Người duyệt task',

    created_at : 'Ngày tạo',
    updated_at : 'Ngày cập nhật',
    created_by_user : 'Người giao',

}

export function formatHeaderTaskSchedule(arrTotalDays) {
    let headerFormat = [];
    Object.keys(header).map((key, i) => {
        headerFormat.push(header[key]); 
    });
    return [headerFormat];
}

export function formatDataTaskSchedule(datas , exportData = {}) { 
    let { baseData } = store.getState();
    let { departments , locations , majors , positions } = baseData
    let result = [];
    datas.map((record, index) => {
        let row = [] 
        Object.keys(header).map((key ,indexKey) => {
            switch (key) {
                case 'stt':
                    row.push(datas.indexOf(record) + 1);
                    break;
                case 'name':
                    row.push(record.data?.name ? record.data?.name : '');
                    break;
                case 'sequences':
                    let foundIndex = optionsSequences.findIndex(s => s.value == record.sequences);
                    row.push(~foundIndex ? optionsSequences[foundIndex].label : '');
                    break;
                case 'status':
                    row.push(scheduleStatus[record.status]);
                    break;
                case 'created_at':
                    row.push(timeFormatStandard(record.created_at, dateFormat));
                    break;
                case 'updated_at':
                    row.push(timeFormatStandard(record.updated_at, dateFormat));
                    break;
                case 'created_by_user':
                    row.push(record.created_by_user?.name ? record.created_by_user?.name : '');
                    break;
                case 'require_media':
                    row.push(record.data?.require_media ? taskRequireOptions.find(o => o.value == record.data.require_media)?.label : '')
                    break;
                case 'planned_hours':
                    row.push(record.data?.planned_hours ? record.data.planned_hours : '')
                    break;
                case 'sub_type':
                    row.push(typeSub_type[record.data?.sub_type])
                    break;
                case 'date':
                    let resultDate = []
                    if (record[key]?.length) {
                        resultDate = record[key].map(value => {
                            let matchingObject = dateOptions.find(item => item.value == value);
                            return matchingObject ? matchingObject.label : null;
                        });
                    }
                    row.push(resultDate.join(','));
                    break;
                case 'month':
                    let resultMonths = []
                    if (record[key]?.length) {
                        resultMonths = record[key].map(value => {
                            let matchingObject = monthOptions.find(item => item.value == value);
                            return matchingObject ? matchingObject.label : null;
                        });
                    }
                    row.push(resultMonths.join(','));
                    break;
                case 'day':
                    let resultDays = []
                    if (record[key]?.length) {
                        resultDays = record[key].map(value => {
                            let matchingObject = dayOptions.find(item => item.value == value);
                            return matchingObject ? matchingObject.label : null;
                        });
                    }
                    row.push(resultDays.join(','));
                    break;
                case 'prid':
                    row.push(exportData.projectDatas[record.data[key]]);
                    break;
                case 'deadline_cal_num':
                    row.push(record.data[key]);
                    break;
                case 'note':
                    // let ColText = []
                    // if(record.data[key]){
                    //     let arrText = record.data[key].split('\n');
                    //     // arrText.map(t => ColText.push(t))
                    //     console.log(arrText)
                    //     row.push(arrText)
                    // }else{
                    // row.push('')
                    // }
                    row.push(record.data[key]);
                    break;
                case 'assign_staff':
                    let resultAssignTo= []
                    if (Array.isArray( record.data[key]) && record.data[key]?.length) {
                        resultAssignTo = record.data[key].map(value => exportData.staffDatas[value]);
                        row.push(resultAssignTo.join(','));
                    }
                    if (!Array.isArray( record.data[key]) && record.data[key]?.length) {
                        row.push(exportData.staffDatas[record.data[key]]);
                    }
                    break;
                case 'report_to':
                    let resultReportTo= []
                    if (record.data[key]?.length) {
                        resultReportTo = record.data[key].map(value => exportData.staffDatas[value]);
                    }
                    row.push(resultReportTo.join(','));
                    break;
                case 'skill_id':
                    row.push(exportData.skillDatas[record.data[key]]);
                    break;
                case 'dept_ids':
                    let resultDept = []
                    if (record.data[key]?.length) {
                        resultDept = record.data[key].map(value => {
                            let matchingObject = departments.find(item => item.id == value);
                            return matchingObject ? matchingObject.name : null;
                        });
                    }
                    row.push(resultDept.join(','));
                    break;
                case 'major_ids':
                    let resultMarjors = []
                    if (record.data[key]?.length) {
                        resultMarjors = record.data[key].map(value => {
                            let matchingObject = majors.find(item => item.id == value);
                            return matchingObject ? matchingObject.name : null;
                        });
                    }
                    row.push(resultMarjors.join(','));
                    break;
                case 'position_ids':
                    let resultPos = []
                    if (record.data[key]?.length) {
                        resultPos = record.data[key].map(value => {
                            let matchingObject = positions.find(item => item.id == value);
                            return matchingObject ? matchingObject.name : null;
                        });
                    }
                    row.push(resultPos.join(','));
                    break;
                case 'locations_ids':
                    let resultLoc = []
                    if (record.data[key]?.length) {
                        resultLoc = record.data[key].map(value => {
                            let matchingObject = locations.find(item => item.id == value);
                            return matchingObject ? matchingObject.name : null;
                        });
                    }
                    row.push(resultLoc.join(','));
                    break;
                case 'isExcluded':
                    row.push(record.data[key] ? 'Có loại trừ' : 'Không loại trừ')
                    break;
                case 'major_approve_ids':
                    let resultMarjorsApprove = []
                    if (record[key]?.length) {
                        resultMarjorsApprove = record[key].map(value => {
                            let matchingObject = majors.find(item => item.id == value);
                            return matchingObject ? matchingObject.name : null;
                        });
                    }
                    row.push(resultMarjorsApprove.join(','));
                    break;
                case 'staff_approve':
                    row.push(exportData.staffDatas[record[key]]);
                    break;
                case 'type':
                    row.push(typeTaskSchedule[record[key]]);
                    break;
                default:
                    row.push(record[key])
                    break;
            }
        })
        result.push(row)
    })
    return result;
}