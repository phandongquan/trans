import dayjs from 'dayjs';
import { staffHistoryCategories,staffHistorySubTypes,staffHistoryLevel,staffHistoryReason,staffHistoryTreatmentMethod,staffHistoryGoodat,staffHistoryWeakness } from '~/constants/basic';
import store from '~/redux/store';
import { convertToSingleObject, parseBitwiseValues, parseIntegertoTime } from '~/services/helper';
import { dateTimeFormat ,WorkType } from '~/constants/basic'
export const header = {
    'counter'   : 'STT',
    'staff'     : 'Tên nhân viên',
    'type'      : 'Hạng Mục',
    'sub_type'  : 'Phân loại',
    'content'   : 'Nội dung',
    'level'     : 'Mức độ vi phạm',
    'reason'    : 'Nguyên nhân',
    'treatment_method' : 'Phương pháp xử lý',
    'file'      : 'Tệp đính kèm',
    'skill'     : 'Kỹ năng liên quan',
    'created_at'      : 'Thời gian vi phạm',
    'location_id'  : 'Chi nhánh làm việc',
    'store_manager' : 'Quản lý chi nhánh nhận xét',
    'pros'      : '',
    'cons'      : '',
    'comment_and_suggest' : '', 
    'note'      :'Ghi chú'
}
const header2 = {
    13 : '',
    14 : 'Ưu điểm',
    15: 'Nhược điểm',
    16: 'Nhận xét và đề xuất'
}

export function formatHeaderHistory() {
    let format_header1 = [];
    let format_header2 = [];
    let merges = [];

    Object.keys(header).map((key, i) => {
        format_header1.push(header[key]);
        if(i < 12 || i > 15 ){
            format_header2.push('')
            merges.push([1, i + 1, 2, i + 1])
        } else {
            format_header2.push(header2[i+1])
        }
    });

    merges.push([1, 13, 1, 16])

    return {
        headers: [format_header1, format_header2],
        merges
    }
}

export function formatData(staffList) {
    let { baseData } = store.getState();
    let { locations } = baseData;
    let result = []
    
    staffList.map((staff ,index) => {
        let row = []
        Object.keys(header).map(key => {            
            switch (key) {              
                case 'counter':                   
                    row.push(++index);                
                    break;
                case 'staff':                   
                    let dataNameStaff = [staff[key]]     
                    dataNameStaff.map(d => {
                       
                        let info = d.staff_name + ' - \n' +d.staff_phone + ' - \n' + d.staff_email
                        row.push(info);
                    }); 
                    break;
                case 'location_id':
                    let locationName = '';                   
                    locations.map(d => {
                        if(d.id==staff[key]) {
                            return locationName = d.name;
                        }
                    });
                    row.push(locationName); break;
                case 'type':
                    row.push(staffHistoryCategories[staff[key]]);                
                    break;
                case 'sub_type':
                    row.push(staffHistorySubTypes[staff[key]]);                
                    break;
                case 'level':
                    row.push(staffHistoryLevel[staff[key]]);                
                    break;
                case 'reason':
                    row.push(staffHistoryReason[staff[key]]);                
                    break;
                case 'treatment_method':
                    row.push(staffHistoryTreatmentMethod[staff[key]]);                
                    break;                
                case 'created_at':
                    row.push(staff.date)                
                break;
                case 'skill':
                    let listSkill = [staff[key]]
                    if(listSkill == ''){
                        row.push('');
                    }         
                    else{
                        listSkill.map(d => {
                            row.push(d.name);
                        });   
                    }        
                break;
                case 'pros':
                    let result = []
                        if(staff.reviews.pros){
                            let arrayPros = JSON.parse("[" + staff?.reviews?.pros + "]");
                            Object.keys(staffHistoryGoodat).map(key => {
                                arrayPros.map(v => {
                                    if (key == v) {     
                                        result.push(staffHistoryGoodat[key])                                        
                                    }
                                })                                  
                            })
                        }
                    row.push(result.join(','));              
                    break;
                case 'cons':
                    let resultCons = []
                        if(staff.reviews.cons){
                            let arrayPros = JSON.parse("[" + staff?.reviews?.cons + "]");
                            
                            Object.keys(staffHistoryWeakness).map(key => {
                                arrayPros.map(v => {
                                    if (key == v) {                           
                                        resultCons.push(staffHistoryWeakness[key])
                                    }
                                })                                  
                            })
                        }
                    row.push(resultCons.join(','));              
                    break;
                case 'comment_and_suggest':                    
                        row.push(staff.reviews.comments_and_suggestions);                
                    break;
                default:
                    row.push(staff[key]); break;
            }
        })
        result.push([...row])
   })
    return result;
}

export const stylesHistory = {

    row: {
        1: {
            width: 30, 
            height: 20, 
            font: { bold: true }, 
            alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
            border: {
                top: {style:'thin'},
                left: {style:'thin'},
                bottom: {style:'thin'},
                right: {style:'thin'}
            }
        },
        2: {
            width: 70, 
            height: 20, 
            font: { bold: true }, 
            alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},
            border: {
                top: {style:'thin'},
                left: {style:'thin'},
                bottom: {style:'thin'},
                right: {style:'thin'}
            }
        }
    },
    col: {
        1: { width: 5,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        2: { width: 25, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        3: { width: 20, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},        
        4: { width: 20, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        5: { width: 60},
        6: { width: 20, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        7: { width: 20, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true}, },
        8: { width: 20, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        9: { width: 20, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},        
        10: { width: 20, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        11: { width: 20, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},        
        12: { width: 20, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},        
        13: { width: 20, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},        
        14: { width: 20, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},                
        15: { width: 30, alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        16: { width: 20 , alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
    },
    cell: {
        'E2': {alignment: {vertical: 'top',wrapText: true }},
        'E3': {alignment: {vertical: 'top',wrapText: true }},
        'E4': {alignment: {vertical: 'top',wrapText: true }},
        'E5': {alignment: {vertical: 'top',wrapText: true }},
        'E6': {alignment: {vertical: 'top',wrapText: true }},
        'E7': {alignment: {vertical: 'top',wrapText: true }},
        'E8': {alignment: {vertical: 'top',wrapText: true }},
        'E9': {alignment: {vertical: 'top',wrapText: true }},
        'E10': {alignment: {vertical: 'top',wrapText: true }},
        'E11': {alignment: {vertical: 'top',wrapText: true }},
        'E12': {alignment: {vertical: 'top',wrapText: true }},
        'E13': {alignment: {vertical: 'top',wrapText: true }},
        'E14': {alignment: {vertical: 'top',wrapText: true }},
        'E15': {alignment: {vertical: 'top',wrapText: true }},
        'E16': {alignment: {vertical: 'top',wrapText: true }},
        'E17': {alignment: {vertical: 'top',wrapText: true }},
        'E18': {alignment: {vertical: 'top',wrapText: true }},
        'E19': {alignment: {vertical: 'top',wrapText: true }},
        'E20': {alignment: {vertical: 'top',wrapText: true }},
        'E21': {alignment: {vertical: 'top',wrapText: true }},
        'E22': {alignment: {vertical: 'top',wrapText: true }},
        'E23': {alignment: {vertical: 'top',wrapText: true }},
        'E24': {alignment: {vertical: 'top',wrapText: true }},
        'E25': {alignment: {vertical: 'top',wrapText: true }},
        'E26': {alignment: {vertical: 'top',wrapText: true }},
        'E27': {alignment: {vertical: 'top',wrapText: true }},
        'E28': {alignment: {vertical: 'top',wrapText: true }},
        'E29': {alignment: {vertical: 'top',wrapText: true }},
        'E30': {alignment: {vertical: 'top',wrapText: true }},
    }
}