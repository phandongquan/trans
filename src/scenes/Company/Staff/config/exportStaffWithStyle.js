import dayjs from 'dayjs';
import { genders, religions, certificates, staffStatus, banks, reasonInActive } from '~/constants/basic';
import store from '~/redux/store';
import { convertToSingleObject, parseBitwiseValues, parseIntegertoTime } from '~/services/helper';
import { salaryModes ,WorkType } from '~/constants/basic'

export const header = {
    'counter' : 'No.',
    'code' : 'ID',
    'staff_name' : 'Full Name',
    'staff_hire_date' : 'Joined date Ngày nhận việc',
    'staff_dept_id' : 'Dept. ( Bộ phận)',
    'division_id' : 'Section Phòng ban',
    'position_id' : 'Position Chức vụ',
    'major_id' : 'Nghiệp vụ',
    'staff_loc_id' : 'Working Place',
    '!length_of_service' : 'Length of Service (Months)( Tháng làm việc)',
    'staff_title': 'Brand',
    'level_shop' : 'Mức lương Level Shop',
    'basic_salary' : 'Basic Salary Lương CB',
    '!salary_rule' : 'Chế độ lương',
    'number_of_working_day' : 'Số ngày làm việc',
    'number_of_hours' : 'Số giờ/ngày',
    'quy_doi_luong_gio' : 'Quy đổi lương giờ',
    'probation_time_of_salary' : 'Probation time of salary Lương TV',
    'phu_cap_chuc_vu' : 'Phụ cấp chức vụ',
    'phu_cap_ky_nang_xang_xe' : 'Phụ cấp kỹ năng/xăng xe',
    'che_do_thuong_nghiep_vu' : 'Chế độ thưởng nghiệp vụ',
    'luong_bhxh' : 'Lương BHXH',
    'bao_hiem_nv' : 'Bảo hiểm (NV 10.5%)',
    'bao_hiem_cty' : 'Bảo hiểm (CTY 21.5%)',
    'contract_salary' : 'Contract Salary Lương hợp đồng',
    'merge_SUPPORT_25' : 'Các khoản hỗ trợ, phụ cấp-chỉ dùng để tính thuế tncn',
    'merge_SUPPORT_26' : '',
    'merge_SUPPORT_27': '',
    'merge_SUPPORT_28': '',
    'merge_SUPPORT_29': '',
    'merge_SUPPORT_30' : '',
    'merge_SUPPORT_31': '',
    'merge_SUPPORT_32' : '',
    'staff_dob' : 'Birth of date Sinh nhật',
    '!age' : 'Years old Tuổi',
    'birth_place' : 'Birth of place Nơi sinh',
    'gender' : 'Sex (X) Gioi Tính',
    'nation' : 'Ethnicism Dân tộc',
    'religion' : 'Religion Tôn giáo',
    'degree_certificate' : 'Degree, certificate Trình độ',
    'cmnd' : 'Identification Card. No CMND',
    'date_issue_card' : 'Ngày cấp CMND',
    'place_card' : 'Nơi cấp CMND',
    'staff_address' : 'Resident address ĐC thường trú',
    'staff_phone' : 'Tel',
    'staff_email' : 'Mail adress',
    'persional_email': 'Persional email',
    'tax_code' : 'Tax Code MST',
    'date_issue_tax' : 'Ngày cấp MST thuế',
    'so_nguoi_giam_tru_gia_canh' : 'Số người giảm trừ gia cảnh',
    'so_tien_giam_tru_gia_canh' : 'Số tiền giảm trừ gia cảnh',
    'bank_account' : 'Bank Account No. TK Ngân hàng (Dùng chuyển khoản)',
    'bank_branch' : "Bank branch's name Chi nhánh",
    'bank_name' : "Bank's name Tên Ngân hàng",
    'thoi_diem_tinh_tham_gia_bhxh' : "Thời điểm tính tham gia BHXH",
    'ho_so_da_nop' : 'Hồ sơ đã nộp',
    'ho_so_con_thieu' : 'Hồ sơ còn thiếu',
    'so_hdld' : 'Số HĐLĐ',
    'ngay_ky_hdld' : 'Ngày ký HĐLĐ',
    'hdld_den_het_ngay' : 'HĐLĐ đến hết ngày',
    'nghi_thai_san_tu' : 'Nghỉ thai sản từ',
    'ngay_nghi_viec' : 'Ngày nghỉ việc',
    'note' : 'Ghi chú',
    'social_insurance_number' : 'Số sổ BHXH',
    'temporary_residence_address' : 'Địa chỉ hiện tại',
    'thuyen_chuyen_cong_tac' : 'Thuyên chuyên công tác',
    'cam_ket_bao_mat' : 'Cam kết bảo mật',
    'cam_ket_thue_tncn' : 'Cam kết thuế TNCN',
    'ten_khong_dau' : 'Tên không DẤU',
    'so_tai_khoan_ngan_hang' : 'Số tài khoản ngân hàng (chưa chuyển khoản)',
    'ky_hd_dao_tao' : 'Ký HĐ đào tạo',
    'hinh_thuc_tinh_thue_tncn' : 'Hình thức tính thuế TNCN',
    'date_out_company': 'Ngày nghỉ việc',
    'cmnd2' : 'Identification Card. Số căn cước công dân 2',
    'date_issue_card_2' : 'Ngày cấp căn cước công dân 2',
    'place_card_2' : 'Nơi cấp căn cước công dân 2',
    'work_type' : 'Work Type',
    'staff_status' : 'Trạng thái',
    'inactive_reason' : 'Lý do nghỉ việc',
    'merge_RELEVANCE_79_1': 'Danh mục hồ sơ đầu vào',
    'merge_RELEVANCE_80_2': '',
    'merge_RELEVANCE_81_4': '',
    'merge_RELEVANCE_82_8': '',
    'merge_RELEVANCE_83_16': '',
    'merge_RELEVANCE_84_32': '',
    'merge_RELEVANCE_85_64': '',
    'merge_RELEVANCE_86_128': '',
    'merge_RELEVANCE_87_256': '',
    'merge_RELEVANCE_88_512': '',    
    'merge_RELEVANCE_89_1024': '',
    'merge_RELEVANCE_90_2048': '',
    'merge_RELEVANCE_91_4096': '',
    'merge_RELEVANCE_92_8192': '',
    'merge_RELEVANCE_93_16384': '',
}

const header2 = {
    25 : 'Tiền ăn giữa ca(No PIT)',
    26: 'Xăng xe',
    27: 'Điện thoại (No PIT)',
    28: 'Nhà ở',
    29 : 'Tiền giữ trẻ/Nuôi con nhỏ',
    30: 'Công tác phí',
    31 : 'Chuyên cần',
    32: 'Khác',
    // RELEVANCE
    79: 'Đơn xin việc',
    80: 'CV',
    81: 'Bằng cấp/Chứng chỉ',
    82: 'Giấy hạnh kiểm',
    83: 'Sổ hộ khẩu',
    84: 'Tạm Trú',
    85: 'Giấy khám SK',
    86: 'Hình 3x4',
    87: 'Lý lịch tư pháp',
    88: 'Giấy bảo lãnh dân sự', 
    89: 'Hợp đồng thử việc',
    90 : 'Cam kết bảo mật thông tin',
    91 :'Cam kết thu nhập chịu thuế',
    92 : 'Hợp đồng đào tạo (khối MP)',
    93 : 'Bản mô tả công việc (khối MP)' 
}

export function formatHeader() {
    let format_header1 = [];
    let format_header2 = [];
    let merges = [];

    Object.keys(header).map((key, i) => {
        format_header1.push(header[key]);
        if(!Object.keys(header2).includes(String(i+1))) {
            format_header2.push('')
            merges.push([1, i + 1, 2, i + 1])
        } else {
            format_header2.push(header2[i+1]);
        }
    });

    merges.push([1, 25, 1, 32]); // Merge SUPPORT
    merges.push([1, 79, 1, 93]); // Merge RELEVANCE
    console.log(merges)
    return {
        headers: [format_header1, format_header2],
        merges
    }
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
    'staff_status': 'Trạng thái',
    'city_id': 'cities',
    'degree_certificate': 'certificates',
    'bank_name': 'banks',
    'place_card_2': 'cities'
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
    'contract_end_date': 'unix',
    'date_out_company': 'unix',
    'date_issue_card_2': 'unix',
};

/**
 * Check key include term for switch
 * 
 * @param {String} key 
 * @param {String} term 
 * 
 * @return boolean
 */
let checkSpecialKey = function (key = '', term = ''){
    if(key.includes(term)){
        return key;
    }

    return;
}

export function formatData(staffList) {
    let { baseData } = store.getState();
    let baseFormat = {};
    Object.keys(baseData).map(key => {
        baseFormat[key] = convertToSingleObject(baseData[key]);
    });
    baseFormat['brands'] = baseData['brands'];
    let brands = {};
    baseFormat['brands'].map(brand => {
        brands[brand.brand_id] = brand.brand_name;
    })
    baseFormat['brands'] = brands;
    baseFormat['certificates'] = certificates;
    baseFormat['genders'] = convertToSingleObject(genders)
    baseFormat['religions'] = convertToSingleObject(religions)
    baseFormat['Trạng thái'] = convertToSingleObject(staffStatus)
    baseFormat['banks'] = convertToSingleObject(banks)

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
                } else if(key == 'work_type'){
                    let workType = WorkType[staff[key]]
                    exportData.push(workType);
                }else if(key == 'inactive_reason'){
                    exportData.push(reasonInActive[staff[key]]);
                }
                else if (key == 'staff_title'){
                    let temp = staff.staff_title.split(',')
                    let brandText = [];
                    temp.map(brand => {
                        brandText.push(baseFormat['brands'][brand]);
                    })
                    exportData.push(`${brandText}`)
                }
                else{
                    exportData.push(staff[key] ? staff[key] : '');
                }

            } else {
                switch (key) {
                    case checkSpecialKey(key, 'merge_RELEVANCE'):
                        let relevance = key.split('_').pop();
                        if(staff?.relevances && (staff.relevances & relevance)){
                            exportData.push('x');
                        }else{
                            exportData.push('');
                        }
                        break;
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
                        exportData.push(ruleTxt.join('+'));
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

export const styleFillYellow = {
    type: 'pattern',
    pattern:'solid',
    fgColor:{argb:'FFF2CC'}
}

export const styleFillGreen = {
    type: 'pattern',
    pattern:'solid',
    fgColor:{argb:'C6E0B4'}
}

export const styleFillDarkYellow = {
    type: 'pattern',
    pattern:'solid',
    fgColor:{argb:'FFFF00'}
}

export const styleFillOrange = {
    type: 'pattern',
    pattern:'solid',
    fgColor:{argb:'F8CBAD'}
}

export const styleFillDarkOrange = {
    type: 'pattern',
    pattern:'solid',
    fgColor:{argb:'F4B084'}
}

export const styles = {
    row: {
        1: {
            width: 70, 
            height: 60, 
            font: { bold: true }, 
            alignment: { vertical: 'top', horizontal: 'center', wrapText: true },
            border: {
                top: {style:'thin'},
                left: {style:'thin'},
                bottom: {style:'thin'},
                right: {style:'thin'}
            }
        },
        2: {
            width: 70, 
            height: 60, 
            font: { bold: true }, 
            alignment: { vertical: 'top', horizontal: 'center', wrapText: true},
            border: {
                top: {style:'thin'},
                left: {style:'thin'},
                bottom: {style:'thin'},
                right: {style:'thin'}
            }
        }
    },
    col: {
        1: { fill: styleFillGreen },
        2: { fill: styleFillGreen, width: 30 },
        3: { fill: styleFillGreen },
        4: { fill: styleFillGreen },
        5: { fill: styleFillYellow, width: 15 },
        6: { fill: styleFillYellow, width: 18 },
        7: { fill: styleFillYellow },
        8: { fill: styleFillYellow, width: 22 },
        9: { fill: styleFillYellow, width: 20 },
        10: { fill: styleFillYellow },
        33: { width: 12 },
        35: { width: 18 },
        38: { width: 18 },
        39: { width: 12 },
        40: { width: 20 },
        41: { width: 18},
        42: { width: 18},
        43: { width: 18},
        44: { width: 20},
        72: { width: 18 },
        73: { width: 18 },
        74: { width: 20 },
        75: { width: 20 },
        76 :{fill: styleFillYellow},
        77 :{fill: styleFillYellow},
        78 :{ width: 30},
    },
    cell: {
        'A1': {
            alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        },
        'B1': {
            alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        },
        'C1': {
            alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        },
        'D1': {
            alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        },
        'K1': { fill: styleFillGreen},
        'L1': { fill: styleFillGreen},
        'M1': { fill: styleFillGreen},
        'N1': { fill: styleFillGreen},
        'O1': { fill: styleFillGreen},
        'P1': { fill: styleFillGreen},
        'Q1': { fill: styleFillGreen},
        'R1': { fill: styleFillGreen},
        'S1': { fill: styleFillGreen},
        'T1': { fill: styleFillGreen},
        'U1': { fill: styleFillGreen},
        'V1': { fill: styleFillGreen},
        'W1': { fill: styleFillGreen},
        'AG1': { fill: styleFillGreen},
        'AH1': { fill: styleFillGreen},
        'AI1': { fill: styleFillGreen},
        'AJ1': { fill: styleFillGreen},
        'AK1': { fill: styleFillGreen},
        'AL1': { fill: styleFillGreen},
        'AM1': { fill: styleFillGreen},
        'AN1': { fill: styleFillGreen},
        'AO1': { fill: styleFillGreen},
        'AP1': { fill: styleFillGreen},
        'AQ1': { fill: styleFillGreen},
        'AR1': { fill: styleFillGreen},
        'AS1': { fill: styleFillGreen},
        'AT1': { fill: styleFillGreen},
        'AU1': { fill: styleFillGreen},
        'AV1': { fill: styleFillGreen},
        'AW1': { fill: styleFillGreen},
        'AX1': { fill: styleFillGreen},
        'AY1': { fill: styleFillGreen},
        'AZ1': { fill: styleFillGreen},
        'BA1': { fill: styleFillGreen},
        'BB1': { fill: styleFillGreen},
        'BC1': { fill: styleFillGreen},
        'BD1': { fill: styleFillGreen},
        'BE1': { fill: styleFillGreen},
        'BF1': { fill: styleFillGreen},
        'BG1': { fill: styleFillGreen},
        'BH1': { fill: styleFillGreen},
        'BI1': { fill: styleFillGreen},
        'BJ1': { fill: styleFillGreen},
        'BK1': { fill: styleFillGreen},
        'BP1': { fill: styleFillGreen},

        'BL1': { fill: styleFillOrange},
        'BM1': { fill: styleFillDarkOrange},
        'BN1': { fill: styleFillDarkOrange},
        'BO1': { fill: styleFillDarkOrange},
        'BQ1': { fill: styleFillDarkOrange},
        'BR1': { fill: styleFillDarkOrange},
        'BS1': { fill: styleFillDarkOrange},
        'BT1': { fill: styleFillDarkOrange},

        'X1': { fill: styleFillDarkYellow},
        'Y1': { fill: styleFillDarkYellow},
        'Z1': { fill: styleFillDarkYellow},
        'AA1': { fill: styleFillDarkYellow},
        'AB1': { fill: styleFillDarkYellow},
        'AC1': { fill: styleFillDarkYellow},
        'AD1': { fill: styleFillDarkYellow},
        'AE1': { fill: styleFillDarkYellow},
        'AF1': { fill: styleFillDarkYellow},
        'Y2': { fill: styleFillDarkYellow},
        'Z2': { fill: styleFillDarkYellow},
        'AA2': { fill: styleFillDarkYellow},
        'AB2': { fill: styleFillDarkYellow},
        'AC2': { fill: styleFillDarkYellow},
        'AD2': { fill: styleFillDarkYellow},
        'AE2': { fill: styleFillDarkYellow},
        'AF2': { fill: styleFillDarkYellow},
        
        'BU1': { fill: styleFillGreen },
        'BV1': { fill: styleFillGreen },
        'BW1': { fill: styleFillGreen },

        'BZ1': { fill: styleFillYellow },
        'BZ2': { fill: styleFillYellow }
    }
}