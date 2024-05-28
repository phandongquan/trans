import dayjs from 'dayjs';
import { genders, religions, certificates, staffStatus } from '~/constants/basic';
import store from '~/redux/store';
import { convertToSingleObject, parseBitwiseValues, parseIntegertoTime } from '~/services/helper';

const dateFormat = 'YYYY-MM-DD';
/**
 * XLS file header
 */
export const header = {
    'counter': 'No.',
    'code': 'Code',
    'staff_name': 'Full Name',
    'staff_title': 'Staff tilte',
    'staff_hire_date': 'Joined date',
    'staff_dept_id': 'Dept.',
    'division_id': 'Section',
    'position_id': 'Position',
    'major_id': 'Major',
    'staff_loc_id': 'Working Place',
    '!length_of_service': 'Length of  Service',
    'staff_dob': 'BOD',
    '!age': 'Age',
    'birth_place': 'Birth of place',
    'gender': 'Gender',
    'nation': 'Nation',
    'religion': 'Religion',
    'degree_certificate': 'Degree, Certificate',
    'cmnd': 'CMND',
    'date_issue_card': 'Ngày cấp CMND',
    'place_card': 'Nơi cấp CMND',
    'temporary_residence_address': 'Temporary address',
    'city_id': 'Thành phố/Tỉnh',
    'district_name': 'Quận/Huyện',
    'wards_name': 'Phường/Xã',
    'staff_phone': 'Tel',
    'staff_email': 'Email',
    'persional_email': 'Personal email',
    'tax_code': 'Tax Code',
    'date_issue_tax': 'Ngày cấp MST thuế',
    'people_circumtance_number': 'Số người giảm trừ gia cảnh',
    'bank_account': 'Bank Account No.',
    'bank_branch': "Bank branch's name",
    'bank_name': "Bank's name",
    '!contract_number1': 'Số HĐLĐ',
    '!contract_register_date1': 'Ngày ký HĐLĐ',
    '!contract_end_date1': 'HĐLĐ đến hết ngày',
    '!contract_number2': 'Số HĐLĐ',
    '!contract_register_date2': 'Ngày ký HĐLĐ',
    '!contract_end_date2': 'HĐLĐ đến hết ngày',
    'social_insurance_number': 'Số sổ BHXH',
    'staff_address': 'Địa chỉ hiện tại',
    'date_out_company': 'Ngày nghỉ việc',
    '!salary_rule': 'Chế độ lương',
    '!salary_mode': 'Attendance Rule',
    'staff_status': 'Status'
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
    'gender': 'genders',
    'religion': 'religions',
    'birth_place': 'cities',
    'place_card': 'cities',
    'staff_status': 'staffStatus',
    'city_id': 'cities',
    'degree_certificate': 'certificates'
};

/**
 * List key need to convert to time text
 */
let convertKeyToTime = {
    'staff_hire_date': 'unix',
    'staff_dob': 'unix',
    'date_issue_card': 'unix',
    'date_issue_tax': 'unix',
    'date_out_company': 'unix',
    'contract_register_date': 'unix',
    'contract_end_date': 'unix'
};

/**
 * Format data from header
 * @param {Array} staffList 
 */
export function formatStaff(staffList) {
    let { baseData } = store.getState();
    let { salaryModes } = baseData;
    let baseFormat = {};
    Object.keys(baseData).map(key => {
        baseFormat[key] = convertToSingleObject(baseData[key]);
    });
    baseFormat['certificates'] = certificates;
    baseFormat['genders'] = convertToSingleObject(genders)
    baseFormat['religions'] = convertToSingleObject(religions)
    baseFormat['staffStatus'] = convertToSingleObject(staffStatus)

    let data = [];
    staffList.map((staff, i) => {
        let exportData = [];
        let salaryArr = parseBitwiseValues(salaryModes, staff.salary_mode);
        Object.keys(header).map(key => {
            if (typeof staff[key] !== 'undefined') {
                if (convertKeyToText[key]) {
                    let text = (staff[key] != 0 && typeof baseFormat[convertKeyToText[key]][staff[key]] !== 'undefined') ? baseFormat[convertKeyToText[key]][staff[key]] : '';
                    exportData.push(text);
                } else if (convertKeyToTime[key]) {
                    let text = staff[key] ? parseIntegertoTime(staff[key], 'YYYY-MM-DD') : '';
                    exportData.push(text);
                } else {
                    exportData.push(staff[key] ? staff[key] : '');
                }

            } else {
                switch (key) {
                    case 'counter':
                        exportData.push(++i);
                        break;
                    case '!length_of_service':
                        // exportData.push(`=(VALUE($C$2)-VALUE(D${i + 3}))/365`);
                        if (staff.staff_hire_date) {
                            let hireDate = dayjs(staff.staff_hire_date * 1000);
                            let currentDate = dayjs();
                            exportData.push(currentDate.diff(hireDate, 'days') / 365);
                        } else {
                            exportData.push('');
                        }
                        break;
                    case '!age':
                        // exportData.push(`=IF(K${i + 3}="", "",(VALUE($C$2)-VALUE(K${i + 3}))/365)`);
                        if (staff.staff_dob) {
                            let dob = dayjs(staff.staff_dob * 1000);
                            let currentDate = dayjs();
                            exportData.push(currentDate.diff(dob, 'days') / 365);
                        } else {
                            exportData.push('');
                        }
                        break;
                    case '!salary_rule':
                        let ruleTxt = [];
                        salaryArr.map(v => ruleTxt.push(salaryModes[v]))
                        exportData.push(ruleTxt.join(', '));
                        break;
                    case '!salary_mode':
                        let modeText = 'No';
                        if (salaryArr.find(v => v == '256')) {
                            modeText = 'Yes';
                        }
                        exportData.push(modeText);
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
    formatStaff
}