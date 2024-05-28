import { isEmpty } from 'lodash';
import dayjs from 'dayjs';
import { dateTimeFormat, leaveReasons, leaveTypes, salaryModes, STAFF_LEAVE_SHIFT_CHANGE_TYPE, WorkType } from '~/constants/basic';
import store from '~/redux/store';
import { parseIntegertoTime, parseBitwiseValues } from '~/services/helper';

const header = {
    'A': 'TT', //A
    'staff_code': 'Mã nhân viên', //B
    'staff_name': 'Tên nhân viên', //C
    'staff_dept_id': 'Phòng ban', //D
    'date': 'Ngày', //E
    'day': 'Thứ',//F
    'G': '', 'H': '',
    'work_date': 'Công chuẩn', //I
    'salary_mode': 'Chế độ lương', //J
    'work': 'Công', //K
    'L': '', 'M': '', 'N': '', 'O': '', 'P': '', 'Q': '', 'R': '',
    'regime': 'Chế độ', //S
    'shift': 'LLV', //T
    'staffsche_time_in': 'Giờ vào LLV', //U
    'staffsche_time_out': 'Giờ ra LLV', //V
    'check_in': 'Giờ vào', //W
    'check_out': 'Giờ ra', // X
    'Y': '', 'Z': '', 'AA': '', 'AB': '', 'AC': '',
    'time_at_company': 'Tổng giờ ở cty Final', // AD
    'staffsche_location_id': 'Địa điểm', //AE
    'department_id': 'Bộ phận', //AF
    'division_id': 'Section', //AG
    'position_id': 'Position', //AH
    'major_id': 'Major', //AI
    'AJ': '',
    'late': 'Vào trễ', //AK
    'early': 'Ra sớm', // AL
    'total_late_early': 'Tổng phút vào trễ ra sớm', //AM
    'leave_note': 'Ghi chú (Bao gồm các giấy tờ đã gửi về phòng HCNS)', //AN
    'leave_type': 'Mã 1', // AO
    'leave_type_2': 'Mã 2', // AP
    'leave_type_3': 'Mã 3', // AQ
    'leave_type_is_ot': 'OT?', //AR
    'leave_from': 'OT From', //AS
    'leave_to': 'OT To', //AT
    'leave_from1': 'OT From(2)', //AU
    'leave_to1': 'OT To(2)', //AV
    'leave_total': 'OT Total', //AW
    'leave_reason': 'Lý do', // AX
    // 'leave_type_wfh': 'Phiếu làm việc tại nhà', // AY
    // 'leave_type_forget': 'Phiếu quên điểm danh', // AZ
    // 'leave_type_late': 'Phiếu điểm danh trễ', // BA
    'AY': 'Tổng phút vào trễ, ra sớm final', // AY
    'AZ': 'Đi trễ không phép', // AZ
    'BA': 'Số lần nghỉ không xin phép (không có phê duyệt)', // BA
    'BB': 'Số lần có lịch nhưng không làm', // BB
    'BC': 'Hỗ trợ hệ số 0.3 làm thêm sau 22h',
    'BD': 'OT hệ số 1,5',
    'BE': 'OT hệ số 2',
    'BF': 'OT sáng, đêm 50,000đ/h'
}

/**
 * Header export salary
 * @returns
 */
export function getHeader() {
    let row1 = [];
    let i = 1;
    while (i <= 47) {
        row1.push(i);
        i++;
    }
    let row2 = [''];
    let row3 = [`Chi tiết bảng chấm công ${dayjs().format('YYYY-MM')}`]
    let row4 = [];
    Object.keys(header).map(key => {
        row4.push(header[key]);
    });
    return [row1, row2, row3, row4];
}

/**
 * Format data export salary
 */
export function formatData(datas, reasons, ots, timeShifts = {}) {
    let { baseData: { departments, divisions, locations, majors, positions } } = store.getState();
    let result = [];
    if (typeof datas == 'object') {
        let i = 5;
        Object.keys(datas).map(sche_staff_id => {
            let schedule = datas[sche_staff_id];
            if (typeof schedule.days == 'object') {
                Object.keys(schedule.days).map(day => {
                    let record = Object.assign({}, header);
                    Object.keys(record).map(key => {
                        record[key] = '';
                    });

                    let scheduleDay = schedule.days[day] != '' ? schedule.days[day] : {};

                    let { leave, leaveTypeSC } = __parseLeaves(scheduleDay['leaves']);

                    let scheduleShifts = [];
                    // Áp dụng filter thay đổi giờ làm việc của ca theo shift mặc định
                    if (!isEmpty(scheduleDay?.shift) && !isEmpty(timeShifts[scheduleDay?.shift])) {
                        scheduleShifts = timeShifts[scheduleDay.shift].split('-');
                        scheduleDay['staffsche_time_in'] = dayjs(day + ' ' + scheduleShifts[0], 'YYYY-MM-DD HH:mm:ss').format('X');
                        scheduleDay['staffsche_time_out'] = dayjs(day + ' ' + scheduleShifts[1], 'YYYY-MM-DD HH:mm:ss').format('X');
                    }
                    // Áp dụng filter thay đổi giờ làm việc của ca với scheduleDay?.leave_type == "SC" && !isEmpty(leave_shift) && !isEmpty(timeShifts[leave_shift])
                    if (leaveTypeSC && !isEmpty(timeShifts[leaveTypeSC.leave_shift])) {
                        scheduleShifts = timeShifts[leaveTypeSC.leave_shift].split('-');
                        scheduleDay['staffsche_time_in'] = dayjs(day + ' ' + scheduleShifts[0], 'YYYY-MM-DD HH:mm:ss').format('X');
                        scheduleDay['staffsche_time_out'] = dayjs(day + ' ' + scheduleShifts[1], 'YYYY-MM-DD HH:mm:ss').format('X');
                    }

                    let dept = departments.find(d => d.id == schedule.staff_dept_id);
                    let location = locations.find(l => l.id == scheduleDay.staffsche_location_id);
                    let division = divisions.find(d => d.id == schedule.division_id);
                    let position = positions.find(p => p.id == schedule.position_id);
                    let major = majors.find(m => m.id == schedule.major_id);

                    let { work, timeAtCompany, leaveType2, scheduleWork } = __workCalculator(scheduleDay, leave);

                    // late and early
                    let { late, early } = __getLateEarly(scheduleDay, work, leave, false, schedule);
                    let totalLateEarly = late + early;

                    // Nếu có đơn nghỉ nửa ngày thì không tính vào trể ra sớm
                    if (__haveHalftimeLeave(scheduleDay)) {
                        totalLateEarly = 0;
                    }

                    // render row
                    record['A'] = i;
                    record['staff_code'] = schedule.code;
                    record['staff_name'] = schedule.name;
                    record['staff_dept_id'] = dept?.name && dept.name;
                    record['department_id'] = dept?.name && dept.name;
                    record['salary_mode'] = __getSalaryMode(schedule);

                    if (scheduleDay) {
                        record['date'] = scheduleDay?.day;
                        record['day'] = scheduleDay?.day_of_week;
                        record['work_date'] = schedule.work_date;
                        record['work'] = Number(work);
                        record['regime'] = '';
                        record['shift'] = scheduleDay?.shift
                        record['staffsche_time_in'] = scheduleDay?.staffsche_time_in ? parseIntegertoTime(scheduleDay?.staffsche_time_in, 'HH:mm:ss') : '';
                        record['staffsche_time_out'] = scheduleDay?.staffsche_time_out ? parseIntegertoTime(scheduleDay?.staffsche_time_out, 'HH:mm:ss') : '';
                        record['check_in'] = scheduleDay?.check_in ? parseIntegertoTime(scheduleDay?.check_in, 'HH:mm:ss') : '';
                        record['check_out'] = scheduleDay?.check_out ? parseIntegertoTime(scheduleDay?.check_out, 'HH:mm:ss') : '';
                        record['time_at_company'] = parseFloat(timeAtCompany.toFixed(2));
                        record['staffsche_location_id'] = location?.name && location.name;
                        record['division_id'] = division?.name && division.name;
                        record['position_id'] = position?.name && position.name;
                        record['major_id'] = major?.name && major.name;
                        record['late'] = late;
                        record['early'] = early;
                        record['total_late_early'] = totalLateEarly;
                        record['leave_note'] = leave?.leave_note;
                        record['leave_type'] = leave?.leave_type;
                        record['leave_type_2'] = leaveType2;
                        record['leave_type_3'] = leaveTypeSC?.leave_type;

                        if (leave?.leave_type == 'WFH') {
                            record['leave_reason'] = 'Làm tại nhà';
                        } else {
                            record['leave_reason'] = leave?.leave_reason ? leaveReasons[leave.leave_reason] : ''
                        }
                        if (ots[sche_staff_id] && ots[sche_staff_id] && ots[sche_staff_id][day]) {
                            if (Array.isArray(ots[sche_staff_id][day])) {
                                let totalOT = 0;
                                ots[sche_staff_id][day].map((ot, index) => {
                                    let otKey = index ? index : '';
                                    record['leave_type_is_ot'] = (typeof ot.leave_type != 'undefined' && ot.leave_type) ? ot.leave_type : '';
                                    record[`leave_from${otKey}`] = ot.leave_from;
                                    record[`leave_to${otKey}`] = ot.leave_to;
                                    record['leave_reason'] = ot?.leave_reason ? leaveReasons[ot.leave_reason] : ''
                                    totalOT += parseFloat(ot.leave_total ? ot.leave_total : 0);

                                    if(ot) {
                                        record['leave_note'] = ot.leave_note;
                                        record['leave_reason'] = ot.leave_reason ? leaveReasons[ot.leave_reason] : ''
                                    }
                                });

                                record['leave_total'] = totalOT;
                            }
                        }

                    } else {
                        record['date'] = dayjs(day, dateTimeFormat).format('DD/MM/YYYY');
                        record['day'] = dayjs(day, dateTimeFormat).format('dddd');
                        record['work'] = 0;
                    }
                    record['AY'] = { formula: __setFormula('IF(OR($AX_i_="Bên ngoài công ty";$AX_i_="Bên trong công ty";$AX_i_="Hết khách";$AX_i_="Lỗi hệ thống");0;IF(AND($AI_i_="Kỹ thuật viên";$AD_i_>8);0;AM_i_))', i) };
                    record['AZ'] = { formula: __setFormula('IF(AND(AY_i_>0;$AP_i_="");1;0)', i) };
                    record['BA'] = { formula: __setFormula('IF(AND(OR($T_i_="A";$T_i_="C";$T_i_="S");$AP_i_="");1;0)', i) };
                    record['BB'] = { formula: __setFormula('IF(AND(AND($T_i_<>"A";$T_i_<>"C";$T_i_<>"S";$T_i_<>"W";$T_i_<>"H";$T_i_<>"R";$T_i_<>"O";$AP_i_<>"A";$AP_i_<>"0.5A";$AP_i_<>"C";$AP_i_<>"0.5C";$AP_i_<>"O";$AP_i_<>"R";$AP_i_<>"W";$T_i_<>"");$AD_i_=0);1;0)', i) };
                    record['BC'] = { formula: __setFormula('IF(AND(V_i_="22:30:00",W_i_<>0),0.5,0)', i) };
                    record['BD'] = { formula: __setFormula('IF(OR(AI_i_<>"CSKH Cosmetic";AW_i_<>2);AW_i_;0)', i) };
                    record['BE'] = 0;
                    record['BF'] = { formula: __setFormula('IF(AND(AI_i_="CSKH Cosmetic";AW_i_=2);AW_i_;0)', i) };
                    record['total_late_early'] = { formula: __setFormula('ROUNDUP((AK_i_+AL_i_)/15;0)*15', i) };


                    if(schedule.major_id==7 && record['work']==1) {
                        let t = (scheduleDay?.staffsche_time_out - scheduleDay?.staffsche_time_in) / 3600;
                        if( t < 9) record['work'] = 0.67;
                    }
                    result.push(Object.values(record))
                    i++;
                })
            }
        })
    }

    return result;
}

/**
 * Define header column for export sheet excel
 */
const summaryHeader = {
    'A': 'ID', 'B': 'Họ và tên', 'C': 'Phòng ban', 'D': 'Nghiệp vụ', 'E': 'Số giờ LV Chuẩn/ngày', 'F': 'Chế độ lương',
    'G': 'Nghỉ phép năm', 'H': 'Nghỉ off tuần', 'I': 'Nghỉ không lương', 'J': 'Nghỉ chế độ/Nghỉ bù/Nghỉ lễ',
    'K': 'Số ngày thực tế đi làm', 'L': 'Tổng số giờ ở công ty', 'M': 'Số phút đi trể về sớm', 'N': 'Số lần đi trể về sớm',
    'O': 'Hỗ trợ hệ số 0.3 làm thêm sau 22h', 'P': 'OT hệ số 1.5', 'Q': 'OT hệ số 2', 'R': 'OT Sáng/Đêm 50.000đ/h', 'S': 'Chế độ chuyên cần', 'T': 'Số lần vi phạm kỷ luật (Nhập tay)',
    'U': 'Tổng số lần đi trể về sớm', 'V': 'Số lần đi trễ về sớm không phép', 'W': 'Số lần đi trễ về sớm có phép',
    'X': 'Số lần đi trễ về sớm có phép tính chuyên cần', 'Y': 'Tổng số lần quên check vân tay', 'Z': 'Số lần quên check vân tay tính chuyên cần',
    'AA': 'Số lần nghỉ không xin phép (không có phê duyệt)', 'AB': 'Số lần có lịch nhưng không làm', 'AC': 'Công tính lương chưa trừ CC', 'AD': 'Số ngày không hưởng lương tình CC',
    'AE': 'Tổng số lần vi phạm chuyên cần', 'AF': 'Thưởng chuyên cần', 'AG': 'Số giờ hỗ trợ ngày Khai trương', 'AH': 'Công chuẩn',
    'AI': 'Số ngày chuẩn đi làm trong tháng', 'AJ': 'Tổng công trong tháng', 'AK': 'Số ngày công tính lương', 'AL': 'Chưa có lịch LV', 'AM': 'CHECK', 'AN': '30', 'AO': 'Tổng thời gian OT',
    'AP': 'Trạng thái', 'AQ': 'Work Type', 'AR':'Joined date', 'AS': 'Check 2', 'AT': 'Tổng công trong tháng không vượt định mức', 'AU': 'Note', 'AV': 'Ca BV 8 tiếng', 'AW': 'KTV & DD OFF 3W', 'AX': 'Ca HC 29 14h=> tính tăng ca 2 tiếng'
}

/**
 * Return header for tab summary
 * @returns
 */
export function getSummaryHeader(params) {
    let row1 = [];
    let i = 1;
    while (i <= 48) {
        row1.push(i);
        i++;
    }
    let row2 = [];
    let row3 = [];
    let constRow2 = {
        "A": `Tổng hợp bảng chấm công ${dayjs().format('YYYY-MM')}`,
        'AD': '05/08/2022',
        'AE': '15/05/22',
        'AF': '22/05/22',
        'AG': '29/05/22',
        'AI': 26, 'AJ': 24, 'AK': 22,
        "AX": `Dữ liệu thêm vào hỗ trợ tính lương`,
    }
    summaryHeader['AN'] = dayjs(params.from_date, "YYYY-MM-DD").daysInMonth();
    let constKeys = Object.keys(constRow2);
    Object.keys(summaryHeader).map(key => {
        if (constKeys.includes(key)) {
            row2.push(constRow2[key]);
        } else {
            row2.push('');
        }

        row3.push(summaryHeader[key]);
    });
    return [row1, row2, row3];
}

/**
 * Format data for tab summary
 *
 * @param {*} datas
 * @param {*} reasons
 * @param {*} ots
 * @param {*} timeShifts
 */
export function formatSummaryData(datas, reasons, ots, timeShifts = {}, salaryStaffConfigs = {}) {
    let { baseData: { departments, divisions, locations, majors, positions } } = store.getState();
    let result = [];
    if (typeof datas == 'object') {
        let i = 4;
        Object.keys(datas).map(sche_staff_id => {
            let staffConfig = salaryStaffConfigs[sche_staff_id] || {};
            let record = Object.assign({}, summaryHeader);
            Object.keys(record).map(key => {
                if (['AW'].includes(key)) {
                    record[key] = '';
                } else {
                    record[key] = 0;
                }

            });
            let schedule = datas[sche_staff_id];
            let dept = departments.find(d => d.id == schedule.staff_dept_id);
            let division = divisions.find(d => d.id == schedule.division_id);
            let position = positions.find(p => p.id == schedule.position_id);
            let major = majors.find(m => m.id == schedule.major_id);
            let locationName = '';

            let leaveA = 0, leaveW = 0, leaveC = 0, leaveLC = 0, leaveF = 0, leaveHR = 0;
            let totalLateEarly = 0, totalLateEarlyTimes = 0, totalLateEarlyNotApprovedTimes = 0, totalWork = 0, totalWorkRealCount = 0, totalTimeAtComp = 0, dayAtCompany = 0;
            let toalLeaveNotApprovedTimes = 0, totalHasScheduleNotWorkTimes = 0;
            let totalOT = 0;
            if (typeof schedule.days == 'object') {
                let dateCalculate = null;

                Object.keys(schedule.days).map(day => {
                    if (!dateCalculate) {
                        dateCalculate = day;
                    }
                    let scheduleDay = schedule.days[day] != '' ? schedule.days[day] : {};

                    let { leave, leaveTypeSC } = __parseLeaves(scheduleDay['leaves']);

                    let scheduleShift = scheduleDay?.shift ? scheduleDay.shift : '';
                    let leaveType = leave?.leave_type ? leave?.leave_type : '';


                    let scheduleShifts = [];
                    // Áp dụng filter thay đổi giờ làm việc của ca theo shift mặc định
                    if (!isEmpty(scheduleDay?.shift) && !isEmpty(timeShifts[scheduleDay?.shift])) {
                        scheduleShifts = timeShifts[scheduleDay.shift].split('-');
                        scheduleDay['staffsche_time_in'] = dayjs(day + ' ' + scheduleShifts[0], 'YYYY-MM-DD HH:mm:ss').format('X');
                        scheduleDay['staffsche_time_out'] = dayjs(day + ' ' + scheduleShifts[1], 'YYYY-MM-DD HH:mm:ss').format('X');
                    }
                    // Áp dụng filter thay đổi giờ làm việc của ca với scheduleDay?.leave_type == "SC" && !isEmpty(leave_shift) && !isEmpty(timeShifts[leave_shift])
                    if (scheduleDay?.leave_type == "SC" && !isEmpty(scheduleDay?.leave_shift) && !isEmpty(timeShifts[scheduleDay?.leave_shift])) {
                        scheduleShifts = timeShifts[scheduleDay.leave_shift].split('-');
                        scheduleDay['staffsche_time_in'] = dayjs(day + ' ' + scheduleShifts[0], 'YYYY-MM-DD HH:mm:ss').format('X');
                        scheduleDay['staffsche_time_out'] = dayjs(day + ' ' + scheduleShifts[1], 'YYYY-MM-DD HH:mm:ss').format('X');
                    }

                    let { work, workRealCount, timeAtCompany, leaveType2, scheduleWork} = __workCalculator(scheduleDay, leave);

                    // Số lần nghỉ tuần
                    if ((scheduleDay.shift == 'W' || leaveType=='W') && !['A', 'C'].includes(leaveType))  leaveW++;
                    else if(work==0.5 && workRealCount==0.5 && !['A', 'C'].includes(leaveType)) leaveW+= 0.5;

                    // Sô lần nghỉ phép năm, nghỉ không lương, nghỉ tuần|nghỉ lễ
                    if (leaveType == 'A' || leaveType2=='0.5A' || leaveType2=='A') {
                        leaveA+= leaveType2=="0.5A" ? 0.5 : 1;
                        if(leaveType2=="0.5A" && workRealCount==1 && timeAtCompany<6) workRealCount = 0.5;
                        if(leaveType2=="0.5A" && workRealCount==0 && scheduleWork==0.5) leaveW+= 0.5;
                    }
                    if (leaveType == 'C' || leaveType2=='0.5C') {
                        leaveC+= leaveType2=='0.5C' ? 0.5 : 1;
                        if(leaveType2=="0.5C" && workRealCount==1 && timeAtCompany<6) workRealCount = 0.5;
                        if(leaveType2=="0.5C" && workRealCount==0 && scheduleWork==0.5) leaveW+= 0.5;
                    }
                    if (leaveType == 'LC') {
                        leaveLC++;
                    }
                    if (leaveType == 'F') {
                        leaveF++;
                    }
                    if (['H', 'R', 'O'].includes(leaveType) || ['H', 'R', 'O'].includes(scheduleShift)) {
                        if(leaveType2=='0.5R') leaveHR+= 0.5;
                        else leaveHR++;
                    }

                    // Get location name if not exist
                    if (!locationName) {
                        let location = locations.find(l => l.id == scheduleDay.staffsche_location_id);
                        locationName = location?.name;
                    }

                    totalWork += parseFloat(work);
                    totalWorkRealCount += parseFloat(workRealCount);

                    //console.log(scheduleDay.day+": work:"+work+" workRealCount:"+workRealCount+" timeAtCompany:"+timeAtCompany+" leaveType2:"+leaveType2+" scheduleWork:"+scheduleWork+" totalWorkRealCount:"+totalWorkRealCount)
                    //console.log(totalWorkRealCount+leaveW+leaveA);


                    totalTimeAtComp += parseFloat(timeAtCompany);
                    dayAtCompany += (timeAtCompany ? 1 : 0); // Số ngày thực tế đi làm
                    // late and early
                    let { late, early } = __getLateEarly(scheduleDay, work, leave, true);
                    let dayLateEarly = (late + early);

                    // Nếu có đơn nghỉ nửa ngày thì không tính vào trể ra sớm
                    if (__haveHalftimeLeave(scheduleDay)) {
                        dayLateEarly = 0;
                    }

                    /**
                     * Tính cho công thức cột AY sheet Detail,  Tổng phút vào trễ, ra sớm final
                     * =IF(OR($AX4="bên ngoài công ty";$AX4="bên trong công ty";$AX4="hết khách";$AX4="lỗi hệ thống";$AX4="sự cố");0;IF(AND($AI4="SPA Technician";$AD4>8);0;AM4))
                     * Với những loại không phải lý do này, và major != 48, số giờ ở công ty < 8
                     * Không tính vào trể ra sớm
                     */
                    if (
                        !(scheduleDay.leave_reason && [3, 4, 5, 6, 7].includes(scheduleDay.leave_reason))
                        && !(schedule.major_id == 48 && timeAtCompany >= 8)
                    ) {
                        totalLateEarly += dayLateEarly;

                        if (dayLateEarly > 0) {
                            totalLateEarlyTimes++;

                            /**
                             * Tính cho công thức cột AZ sheet Detail, Đi trễ không phép
                             * =IF(AND(AY10515>0;$AP10515="");1;0)
                             * AP: leaveType2
                             * Nếu có totalLateEarly và không tồn tại đơn thì +1 lần vào trể ra sớm không duyệt
                             */
                            !leaveType2 && totalLateEarlyNotApprovedTimes++;
                        }
                    }

                    /**
                     * Tính cho công thức cột BA sheet Detail, Số lần nghỉ không xin phép (không có phê duyệt)
                     * =IF(AND(OR($T4="A";$T4="c";$T4="s");$AP4="");1;0)
                     * AP: leaveType2
                     * Nếu có totalLateEarly và không tồn tại đơn thì +1 lần vào trể ra sớm
                     */
                    if (["A", 'C', 'S'].includes(scheduleDay?.shift) && !leaveType2) {
                        toalLeaveNotApprovedTimes++;
                    }

                    /**
                     * Tính cho công thức cột BB sheet Detail, Số lần có lịch nhưng không làm
                     * =IF(AND(AND($T4<>"A";$T4<>"c";$T4<>"s";$T4<>"w";$T4<>"H";$T4<>"");$AD4=0;$AP4="");1;0)
                     * AP: leaveType2, AD: timeAtCompany
                     */
                    if (!["A", 'C', 'S', 'W', 'H', ''].includes(scheduleDay?.shift) && !leaveType2 && !timeAtCompany) {
                        totalHasScheduleNotWorkTimes++;
                    }

                    /**
                     * Tính cho công thức cột BD,BF sheet Detail, OT hệ số 2 và OT đến sáng
                     * Sum BD: =IF(OR(D4<>"INS-OPE";AW4<>2);AW4;0)
                     * Sum BF: =IF(AND(AF4="INS-OPE";AU4=2);AU4;0)
                     *
                     * Detail D: Department = Detail AF: Department
                     * Detail AU:
                     * Detail AW: Tổng thời gian OT trong ngày
                     */
                    if (ots[sche_staff_id] && ots[sche_staff_id] && ots[sche_staff_id][day] && Array.isArray(ots[sche_staff_id][day])) {
                        ots[sche_staff_id][day].map((ot, index) => {
                            totalOT += parseFloat(ot.leave_total ? ot.leave_total : 0);
                        });

                    }
                });

                // render row
                record['A'] = schedule.code;
                record['B'] = schedule.name;
                record['C'] = dept?.name && dept.name;
                record['D'] = schedule.major_id == 25 ? 'Doctor' : major?.name;
                record['E'] = __getTimeInDayMode(schedule);
                record['F'] = __getSalaryMode(schedule);

                record['G'] = leaveA;
                record['H'] = leaveW;
                // record['I'] = leaveC;
               // record['I'] = { formula: __setFormula('COUNTIFS(Detail!$B:$B,Sum!$A_i_,Detail!$AP:$AP,"C")+COUNTIFS(Detail!$B:$B,Sum!$A_i_,Detail!$AP:$AP,"0.5C")*0.5+AA_i_+AB_i_+AL_i_', i) };
                record['I'] = { formula: __setFormula('AN3 - ($G_i_+$H_i_+$J_i_+$K_i_+$AL_i_)', i) };


                record['J'] = leaveHR;
                /*
                record['J'] = {
                    formula: __setFormula('COUNTIFS(Detail!$B:$B,Sum!$A_i_,Detail!$AO:$AO,"R")'
                        + '+COUNTIFS(Detail!$B:$B,Sum!$A_i_,Detail!$AO:$AO,"0.5R")*0.5'
                        + '+COUNTIFS(Detail!$B:$B,Sum!$A_i_,Detail!$AO:$AO,"O")'
                        + '+COUNTIFS(Detail!$B:$B,Sum!$A_i_,Detail!$T:$T,"H")', i)
                };
                 */

                record['K'] = totalWorkRealCount;
                record['L'] = parseFloat(totalTimeAtComp.toFixed(1));
                //record['L'] = { formula: __setFormula('ROUND(SUMIF(Detail!$B:$B,$A_i_,Detail!$AD:$AD),1)', i) };

                // record['M'] = parseFloat(totalLateEarly.toFixed(1));
                record['M'] = { formula: __setFormula('SUMIF(Detail!$B:$B,$A_i_,Detail!$AY:$AY)', i) };

                record['N'] = { formula: __setFormula('COUNTIFS(Detail!$B:$B,Sum!$A_i_,Detail!$AM:$AM,">0")', i) };

                //OT hệ số 1
                // record['O'] = 0;
                record['O'] = { formula: __setFormula('SUMIF(Detail!$B:$B,$A_i_,Detail!$BC:$BC)', i) };

                //OT hệ số 1,5
                record['P'] = { formula: __setFormula('SUMIF(Detail!$B:$B,$A_i_,Detail!$BD:$BD)-AG_i_+(AW_i_*2)', i) };

                //OT hệ số 2
                record['Q'] = { formula: __setFormula('IF(SUMIFS(Detail!$AD:$AD,Detail!B:B,Sum!$A_i_,Detail!$AD:$AD,">0",Detail!$E:$E,"01/05/2022")>E_i_,E_i_,SUMIFS(Detail!$AD:$AD,Detail!B:B,Sum!$A_i_,Detail!$AD:$AD,">0",Detail!$E:$E,"01/05/2022"))+IF(SUMIFS(Detail!$AD:$AD,Detail!B:B,Sum!$A_i_,Detail!$AD:$AD,">0",Detail!$E:$E,"30/04/22")>E_i_,E_i_,SUMIFS(Detail!$AD:$AD,Detail!B:B,Sum!$A_i_,Detail!$AD:$AD,">0",Detail!$E:$E,"30/04/22"))', i) };

                record['R'] = { formula: __setFormula('SUMIF(Detail!$B:$B,$A_i_,Detail!$BF:$BF)', i) };

                record['S'] = __getDiligenceMode(schedule); // Chế độ chuyên cần theo staff major
                // record['T'] = ''; //Số lần vi phạm kỷ luật (Nhập tay)

                // record['U'] = totalLateEarlyTimes; // Tổng số lần đi trể về sớm
                record['U'] = { formula: __setFormula('COUNTIFS(Detail!$B:$B,Sum!$A_i_,Detail!$AY:$AY,">0")', i) };

                // record['V'] = totalLateEarlyNotApprovedTimes; // Tổng số lần đi trể về sớm không phép
                record['V'] = { formula: __setFormula('SUMIFS(Detail!$AZ:$AZ,Detail!B:B,Sum!$A_i_)', i) };

                // record['W'] = leaveLC;
                record['W'] = { formula: __setFormula('$U_i_-$V_i_', i) };
                record['X'] = { formula: __setFormula('+INT($W_i_/2)', i) };
                record['Y'] = { formula: __setFormula('COUNTIFS(Detail!$AO:$AO,"F",Detail!$AX:$AX,"Lỗi cá nhân",Detail!$B:$B,Sum!$A_i_)+COUNTIFS(Detail!$AO:$AO;"L";Detail!$AX:$AX;"Lỗi cá nhân";Detail!$B:$B;Sum!$A_i_)', i) };
                record['Z'] = { formula: __setFormula('INT(COUNTIFS(Detail!$AO:$AO;"L";Detail!$AX:$AX;"Lỗi Thiết bị";Detail!$B:$B;Sum!$A_i_)/2)', i) };
                record['AA'] = { formula: __setFormula('IF(OR($D_i_="Doctor",$D_i_="Giao hàng nhanh",$D_i_="Giao hàng cố định",$D_i_="Tạp vụ",$D_i_="Bảo vệ"),0,SUMIF(Detail!$B:$B,$A_i_,Detail!$BA:$BA))', i) };
                record['AB'] = { formula: __setFormula('IF(OR($D_i_="Doctor";$D_i_="Tạp vụ";$D_i_="Bảo vệ");0;SUMIF(Detail!$B:$B;$A_i_;Detail!$BB:$BB))', i) };
                record['AC'] = { formula: __setFormula('IF($F_i_="BS",SUMIF(Detail!$B:$B,$A_i_,Detail!$AD:$AD),$K_i_+$G_i_+$J_i_)', i) };
                record['AD'] = { formula: __setFormula('INT(I_i_/3)', i) };
                // Tổng số lần vi phạm chuyên cần
                record['AE'] = { formula: __setFormula('IF($S_i_="No",$T_i_+$V_i_+$X_i_+$Z_i_+$AA_i_+$AB_i_,$T_i_+$V_i_+$X_i_+$Z_i_+AD_i_+$AB_i_+$Y_i_)', i) };
                record['AF'] = { formula: __setFormula('IF(IF($S_i_="No";0;IF($AE_i_=0;(500000/AI_i_)*AS_i_;IF($AE_i_=1;(500000/AI_i_)*AS_i_-50000;IF($AE_i_=2;(500000/AI_i_)*AS_i_-150000;0))))>500000;500000;IF(IF($S_i_="no";0;IF($AE_i_=0;(500000/AI_i_)*AS_i_;IF($AE_i_=1;(500000/AI_i_)*AS_i_-50000;IF($AE_i_=2;(500000/AI_i_)*AS_i_-150000;0))))>0;IF($S_i_="no";0;IF($AE_i_=0;(500000/AI_i_)*AS_i_;IF($AE_i_=1;(500000/AI_i_)*AS_i_-50000;IF($AE_i_=2;(500000/AI_i_)*AS_i_-150000;0))));0))', i) };
                record['AG'] = { formula: __setFormula('SUMIFS(Detail!$AW:$AW;Detail!$E:$E;Sum!$AG$2;Detail!$B:$B;Sum!$A12;Detail!$AX:$AX;"Hỗ trợ khai trương")+SUMIFS(Detail!$AW:$AW;Detail!$E:$E;Sum!$AE$2;Detail!$B:$B;Sum!$A_i_;Detail!$AX:$AX;"Hỗ trợ khai trương")+SUMIFS(Detail!$AW:$AW;Detail!$E:$E;Sum!$AD$2;Detail!$B:$B;Sum!$A_i_;Detail!$AX:$AX;"Hỗ trợ khai trương")+SUMIFS(Detail!$AW:$AW;Detail!$E:$E;Sum!$AC$2;Detail!$B:$B;Sum!$A_i_;Detail!$AX:$AX;"Hỗ trợ khai trương")+SUMIFS(Detail!$AW:$AW;Detail!$E:$E;Sum!$AF$2;Detail!$B:$B;Sum!$A_i_;Detail!$AX:$AX;"Hỗ trợ khai trương")', i) };

                let workingDay = staffConfig.ngay_lam_viec ? staffConfig.ngay_lam_viec : __getWorkingDay(schedule); // Công chuẩn trong 1 tháng

                // Công chuẩn thực tế trong tháng 31 ngày, 28, 29 ngày... tháng 5 ngày chủ nhật...
                let workingDayInMonth = __getWorkingDayInCurentMonth(dateCalculate, workingDay);

                record['AH'] = workingDay;
                // record['AI'] = totalWork;
                record['AI'] = workingDayInMonth;
                // record['AJ'] = __countHaveNoSchedule(schedule.days);  // Số ngày không có lịch làm việc
                record['AJ'] = { formula: __setFormula('SUMIF(Detail!$B:$B;$A_i_;Detail!$K:$K)', i) };
                record['AK'] = { formula: __setFormula('IF(OR(F_i_="Monthly";F_i_="Monthly+Bonus";F_i_="Service";F_i_="GHN");IF(AJ_i_<AI_i_;AH_i_-(AI_i_-AJ_i_);AH_i_);AJ_i_)', i) };
                record['AK'] = { formula: __setFormula('IF(K_i_<AH_i_/2;AJ_i_;IF(OR(F_i_="Monthly";F_i_="Monthly+Bonus";F_i_="Service";F_i_="GHN");IF(AJ_i_<AI_i_;AH_i_-(AI_i_-AJ_i_);AH_i_);AJ_i_))', i) };
                record['AL'] = { formula: __setFormula('COUNTIFS(Detail!B:B;Sum!A_i_;Detail!T:T;"")', i) };
                record['AM'] = { formula: __setFormula('SUM(G_i_:K_i_)', i) };
                record['AN'] = { formula: __setFormula('IF(OR($D_i_="Doctor");"EX";IF(AL_i_+AM_i_=$AN$3;"OK";"NG"))', i) };
                record['AO'] = totalOT;
                record['AP'] = schedule.staff_status==1 ? 'Active' : 'In-Active';
                record['AQ'] = WorkType[schedule.work_type];
                record['AR'] = WorkType[schedule.joined_date];
                record['AS'] = { formula: __setFormula('IF(OR($F_i_="Daily";$F_i_="BS";$F_i_="Parttime";$K_i_=0;$H_i_<4);0;$AH_i_-$AL_i_-$I_i_-$AK_i_)', i) };
               
                record['AU'] = { formula: __setFormula('ROUND(IF(COUNTIFS(Detail!$B:$B;Sum!$A_i_;Detail!$K:$K;">=0.5")>$AI_i_;$AI_i_;COUNTIFS(Detail!$B:$B;Sum!$A_i_;Detail!$K:$K;">=0.5"));0)', i) };
                record['AV'] = { formula: __setFormula('COUNTIFS(Detail!$B:$B;Sum!$A_i_;Detail!$AI:$AI;"Bảo vệ";Detail!$T:$T;"AM 3")+COUNTIFS(Detail!$B:$B;Sum!$A_i_;Detail!$AI:$AI;"Bảo vệ";Detail!T:T;"HC 17")+COUNTIFS(Detail!B:B;Sum!$A_i_;Detail!$AI:$AI;"Bảo vệ";Detail!T:T;"PM 10")+COUNTIFS(Detail!B:B;Sum!A_i_;Detail!$AI:$AI;"Bảo vệ";Detail!$T:$T;"PM 8")', i) };
                record['AW'] = { formula: __setFormula('IF(AND($F_i_="Service";$H_i_<4;$K_i_>=$AH_i_);$E_i_;0)', i) };
                record['AX'] = { formula: __setFormula('COUNTIFS(Detail!$B:$B;Sum!$A_i_;Detail!$AD:$AD;">14";Detail!$T:$T;"HC 29")', i) };
            }
            result.push(Object.values(record));

            i++;
        })
    }

    return result;
}

/**
 * Parse list leave
 *
 * @param {*} leaves
 *
 * @returns
 */
function __parseLeaves(leaves = []) {
    let leaveTypeSC = null;
    let leave = null;
    leaves.map(v => {
        if (v.leave_type == STAFF_LEAVE_SHIFT_CHANGE_TYPE) {
            leaveTypeSC = v;
        } else {
            leave = v;
        }
    });
    return { leave, leaveTypeSC };
}

/**
 * Set formula for excel
 * @param {String} formulaStr
 * @param {Number} rowI
 * @returns
 */
function __setFormula(formulaStr, rowI) {
    return formulaStr.replace(/;/g, ',').replace(/_i_/g, rowI);
}

/**
 * Chế độ lương theo staff
 * @param {Object} scheduleList
 */
function __getSalaryMode(staff = {}) {
    if (!staff.salary_mode) {
        return 'Monthly';
    }
    let { major_id } = staff;
    if( [7, 50, 47].includes(major_id)) {
        // Bảo vệ, tạp vụ, shipper nội bộ  là Daily
        return "Daily";
    }
    if ([25].includes(major_id)) {
        return "BS";
    }
    if ([31].includes(major_id)) {
        return "GHN";
    }
    let bitwiseDatas = parseBitwiseValues(salaryModes, staff.salary_mode);
    let textArr = [];
    bitwiseDatas.map(v => textArr.push(salaryModes[v]));
    return textArr.join('+');
}

/**
 * Chế độ chuyên cần theo staff
 * @param {Object} scheduleList
 */
function __getDiligenceMode(staff) {
    let { major_id } = staff;
    if ([7, 11, 8, 26, 4, 41, 71, 9, 50, 65, 60, 74, 58].includes(major_id)) {
        // bảo vệ, CSKH, C&B, Đóng gói, hành chánh, NVMP, pha chế, phát triển cữa hàng, quản lý cửa hàng, tạp vụ, tele &CS, tuyển dụng, quản lý khu vực, xử lý đơn hàng
        return 'Yes';
    }

    return 'No'
}


/**
 * Chế độ giờ làm trong ngày
 * Tạp vụ: 9 (9h/ngày), Shipper nội bộ, Pha chế: 10, Giao hàng nhanh|Bảo vệ: 12, còn lại: 8
 */
function __getTimeInDayMode(staff) {
    let { major_id } = staff;
    if ([7, 31].includes(major_id)) { // Bảo vệ | Giao hàng nhanh
        return 12;
    }
    if ([5].includes(major_id)) { // Tạp vụ
        return 9;
    }
    if ([47, 41].includes(major_id)) { // Shipper nội bộ, pha chế
        return 10;
    }
    return 8;
}


/**
 * Lấy công chuẩn theo major
 * @param {Object} staff
 */
function __getWorkingDay(staff) {
    let { staff_dept_id, division_id, major_id, position_id } = staff;
    if ([8].includes(position_id)) { // Manager
        return 22;
    }
    if ([100, 133, 110].includes(staff_dept_id) || [153, 159, 123, 161, 145].includes(division_id)) { // BOD, TECH department, TECH division
        if (division_id == 163 || major_id == 68) { // Division Design || Major IT helpdesk
            return 24;
        }
        return 22;
    }
    if ([7, 50, 41, 47].includes(major_id)) { // Bảo vệ, nghiệp vụ, pha chế, Shipper nội bộ
        return 28;
    }

    if ([25, 6, 31].includes(major_id)) { // Bác sĩ, bảo trì, giao hàng nhanh
        return 26;
    }

    if ([108, 121].includes(staff_dept_id) && ![20, 33, 21, 64, 54].includes(major_id)) { // [Clinic, Cosmetics] Department| [đào tạo, iso, kế toán, kho, thu mua spa] Major
        return 26;
    }

    return 24; // Khối văn phòng
}


/**
 * Lấy công chuẩn theo tháng
 * @param {Object} staff
 */
function __getWorkingDayInCurentMonth(dateCalculate, workingDays) {
    let daysInMonth = dayjs(dateCalculate).daysInMonth();
    let saturdays = __getAmountOfWeekDaysInMonth(dayjs(dateCalculate), 5);
    let sundays = __getAmountOfWeekDaysInMonth(dayjs(dateCalculate), 6)
    let realDayInMonths = null;
    /**
     * Tính trung bình số ngày theo hệ số
     * @param {*} count
     * @param {*} factor // 0: không tính, .5: tính nữa ngày, 1: tính nguyên ngayf
     * @returns
     */
    let avgFunc = function (count, factor) {
        return count - (count * factor);
    };
    switch (workingDays) {
        case 22:
            realDayInMonths = daysInMonth - (avgFunc(saturdays, 0) + avgFunc(sundays, 0)); // Nghỉ thứ 7, chủ nhật
            break;
        case 28:
            // realDayInMonths = daysInMonth - (avgFunc(saturdays, 1) + avgFunc(sundays, .5)); // Chủ nhật làm nữa ngày
            realDayInMonths = workingDays;
            break;
        case 26:
            // realDayInMonths = daysInMonth - (avgFunc(saturdays, 1) + avgFunc(sundays, 0)); // Thứ 7 đi làm, nghỉ chủ nhật
            realDayInMonths = daysInMonth - 4; // Được phép nghỉ 4 ngày trong tháng
            break;
        default: // 24
            realDayInMonths = daysInMonth - (avgFunc(saturdays, .5) + avgFunc(sundays, 0)); // Thứ 7 làm nữa ngày
            break;
    }

    return realDayInMonths;
}

/**
 * Đếm số lần các thứ xuất hiện trong 1 tháng
 *
 * @param {dayjs()} date //
 * @param {Number} weekday // Thứ mấy trong tuần
 * @return {Number}
 */
function __getAmountOfWeekDaysInMonth(date, weekday) {
    var dif = (7 + (weekday - date.weekday())) % 7 + 1;
    return Math.floor((date.daysInMonth() - dif) / 7) + 1;
}

/**
 * Đếm số ngày không có lịch làm việc
 * @param {*} scheduleList
 */
function __countHaveNoSchedule(scheduleList = {}) {
    let dateList = Object.keys(scheduleList);
    return dayjs(dateList[0]).daysInMonth() - dateList.length;
}

/**
 * Tính số ngày chấm công, thời gian làm việc tại công ty
 *
 * @param {Object} scheduleDay
 * @param {Object} leave
 * @const leave_type
 * 	{ key: 'W', name: 'Nghỉ phép tuần' },
 *  { key: 'A', name: 'Nghỉ phép năm' },
 *  { key: 'H', name: 'Nghỉ phép lễ' },
 *  { key: 'R', name: 'Nghỉ chế độ' },
 *  { key: 'O', name: 'Nghỉ bù' },
 *  { key: 'C', name: 'Nghỉ phép không lương' },
 *  { key: 'LC', name: 'Đi trễ' },
 *  { key: 'EL', name: 'Về sớm' },
 *  { key: 'F', name: 'Quên điểm danh' },
 *  { key: 'L', name: 'Điểm danh trễ' },
 *  { key: 'OT', name: 'Tăng ca' },
 *  { key: 'BT', name: 'Đi công tác' },
 *  { key: 'SC', name: 'Đổi ca' },
 *  { key: 'NO', name: 'Không có' },
 *  { key: 'WFH', name: 'Làm tại nhà' }
 * @returns Object
 */
function __workCalculator(scheduleDay = {}, leave = {}) {
    // work and leave type
    let workRealCount = 0;
    let work = 0;
    let scheduleShift = scheduleDay?.shift ? scheduleDay?.shift : '';
    let leaveType = leave?.leave_type ? leave?.leave_type : '';

    let isHalftimeLeave = __haveHalftimeLeave(leave);
    /**
     * Tính số giờ của ca làm việc để xác định lịch làm việc nửa ngày
     */
    let scheduleTimeIn = dayjs(scheduleDay.staffsche_time_in * 1000);
    let scheduleTimeOut = dayjs(scheduleDay.staffsche_time_out * 1000);
    let scheduleHours = scheduleTimeOut.diff(scheduleTimeIn, 'hours');

    let scheduleWork = scheduleHours <= 6 ? (scheduleHours> 0 ? 0.5 : 0) : 1;
    if(scheduleShift=='HC 17') scheduleWork = 1;

    if(['T'].includes(scheduleShift)) {
        work = 1; workRealCount = 1;
    } else if (scheduleShift && ['H', 'O'].includes(scheduleShift)) { // Ngày nghỉ lễ
        work = 1; //scheduleWork;
    } else if (['LC', 'EL', 'L'].includes(leaveType)) {
        // Trường hợp có đơn xin đi trể nhưng không checkin, checkout đầy đủ thì không tính công
        if (
            ((!scheduleDay.check_in || scheduleDay.check_in == 0) &&  ['LC', 'L', 'EL'].includes(leaveType)) ||
            ((!scheduleDay.check_out || scheduleDay.check_out == 0) && !['EL'].includes(leaveType))
            ) {
            work = 0;
        } else {
            work = scheduleWork;
        }
    } else if (['F', 'R'].includes(leaveType)) {
        work = scheduleWork;
    } else if (['A'].includes(leaveType)) {
        // Nghỉ phép năm
        // Nếu thời gian nghỉ là nửa ngày, và ca làm việc là 1 ngày
        // Kiểm tra nửa ngày còn lại có đi làm không
        // Nếu có đi làm thì tính full công, không đi làm thì trừ nửa ngày công
        if (isHalftimeLeave && scheduleWork == 1 && (!scheduleDay.check_in || !scheduleDay.check_out)) {
            work = .5;
        } else {
            work = scheduleWork;
        }
    } else if (['BT', 'WFH', 'OT', 'O', 'T'].includes(leaveType)) {
        if (scheduleShift && ['C', 'W'].includes(scheduleShift)) {
            work = 0;
        } else {
            work = scheduleWork;
        }
    }

    if (
        work == 0 && scheduleDay?.check_in && scheduleDay.check_out
        && scheduleDay.check_in != 0 && scheduleDay.check_out != 0
        && scheduleShift && (scheduleShift.includes('HC') || scheduleShift.includes('AM') || scheduleShift.includes('PM'))
    ) {
        work = scheduleWork;
    }

    let timeAtCompany = scheduleDay?.time_at_company && scheduleDay.time_at_company ? scheduleDay.time_at_company : 0;

    // Leavetype BT,WFH, F, L Thời gian ở công ty = thời gian lịch làm việc
    if (['BT', 'WFH', 'F', 'T'].includes(leaveType)) {
        timeAtCompany = scheduleHours;
    }

    let leaveType2 = isHalftimeLeave ? '0.5'+leaveType : leaveType;
    if(scheduleShift && scheduleShift=='A') leaveType2 = 'A';

    if(scheduleShift && (scheduleShift.includes('HC') || scheduleShift.includes('AM') || scheduleShift.includes('PM'))) {
        workRealCount = isHalftimeLeave ? 0.5 : scheduleWork;
        if(!timeAtCompany || leaveType2=='A') workRealCount = 0;
    }
    if(leaveType2=='A' || leaveType2=='O' || leaveType2=='R' ) {work = 1; workRealCount=0;}
    if(leaveType2=='C') {work=0; workRealCount=0;}
    else if(leaveType2=='0.5C') { work = (work==1) ? 0.5 : 0; workRealCount = work; }
    if(scheduleShift=='T') {timeAtCompany=8; workRealCount=1;}

    //console.log("leaveType:"+leaveType+" leaveType2:"+leaveType2+ " scheduleShift:"+scheduleShift);
    return { work, workRealCount, timeAtCompany, leaveType2, scheduleWork};
}

/**
 * Check leave have leave halftime
 * @param {*} scheduleDay
 * @return {Boolean}
 */
function __haveHalftimeLeave(leave) {
    return (leave?.leave_shift && ['AM', 'PM'].includes(leave?.leave_shift));
}

/**
 * Get late, early time by schedule
 *
 * @param {Object} scheduleDay
 * @param {Number} work
 * @param {Object} leave
 * @param {Boolean} isSummary Flag luôn luôn tính thời gian đi trể, về sớm trong trường hợp tính summary
 *
 * @return Object
 */
function __getLateEarly(scheduleDay = {}, work = 0, leave = {}, isSummary = false, staffSchedule = {}) {
    let leaveType = leave?.leave_type ? leave.leave_type : '';
    let leaveShift = leave?.leave_shift ? leave.leave_shift : '';
    let late = 0;
    let early = 0;

    // Không tính vào trể ra sớm với leaveType BT, WFH, A, H, O, F
    if (['BT', 'WFH', 'A', 'H', 'O', 'F', 'T', 'C'].includes(leaveType)) {
        return { late, early };
    }
    /**
     * Nếu ca làm việc C, W hoặc không được tính công
     * Reset giờ vào trể, ra sớm và số giờ ở công ty
     * @date 05.11.2021
     */
    if ((['C', 'W', 'T'].includes(scheduleDay.shift) || work == 0) && !isSummary) {
        return { late, early };
    }
    /**
     * @case có 2 schedule, 1 shift = C và 1 shift = HC, AM, PM
     * @case Trường hợp dời lịch làm việc đã có timesheet qua ngày khác
     * Số phút vào trể, ra sớm API trả về bị sai
     * Nên cần tính lại số phút vào trể ra sớm
     */
    if (scheduleDay.staffsche_time_in && scheduleDay.check_in) {
        if (leaveType == 'A' && leaveShift == 'AM') {
            late = 0;
        } else {
            if (scheduleDay.staffsche_time_in < scheduleDay.check_in) {
                late = Math.abs(dayjs.unix(scheduleDay.staffsche_time_in).diff(dayjs.unix(scheduleDay.check_in), 'minutes'));
            } else {
                late = 0;
            }
        }

    }
    if (scheduleDay.staffsche_time_out && scheduleDay.check_out) {
        if (leaveType == 'A' && leaveShift == 'PM') {
            early = 0;
        } else {
            // Đối với major giao hàng nhanh, nếu về trước 18h mới tính về sớm
            let isGHNmajor = (staffSchedule.major_id == 31);
            let skipCalculatEarly = false;
            if (isGHNmajor && scheduleDay.shift == 'HC 6') {
                let checkOutDay = dayjs.unix(scheduleDay.staffsche_time_out).format('YYYY-MM-DD');
                let checkOutDate = dayjs(`${checkOutDay} 18:00:00`);
                skipCalculatEarly = (scheduleDay.check_out >= checkOutDate.format('X'));
            }

            if (scheduleDay.staffsche_time_out > scheduleDay.check_out && !skipCalculatEarly) {
                early = Math.abs(dayjs.unix(scheduleDay.staffsche_time_out).diff(dayjs.unix(scheduleDay.check_out), 'minutes'));
            } else {
                early = 0;
            }
        }

    }

    return { late, early };
}

export default {
    getHeader,
    formatData
}