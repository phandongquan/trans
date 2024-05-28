import { dateFormat, projectTaskStatus, projectTaskProgress } from '~/constants/basic';
import { timeFormatStandard } from '~/services/helper';
import store from '~/redux/store';

export const header = {
    'no': 'No',    
    'staff_code': 'Mã nhân viên',    
    'staff_name': 'Người thực hiện',
     
    'department': 'Department',
    'division': 'Bộ Phận',
    'major':'Vị Trí',
    'location':'Chi nhánh',
    'project_name': 'Phân nhóm công việc',
    'code': "Mã công việc",
    'name': 'Tên Công việc',    
    'workflow': 'Workflow step',
    'amount_of_work': 'Khối lượng',
    'date_start': 'Ngày bắt đầu',
    'date_end': 'Deadline',
    'updated_at': 'Ngày duyệt',    
    //'reality_date': 'Ngày thực tế',
    //'progress': 'Tiến độ',
    'status': 'Trạng thái',
    'planned_hours': 'Số giờ dự định',
    'reality_hours': 'Số giờ thực tế',
    'confirm_hours': 'Số giờ xác nhận'
    
    
}

export function getHeader() {
    let result = [];
    Object.keys(header).map(key => {
        result.push(header[key]);
    });
    return [result];
}

export function formatData(data) {
    let result = [];
    let { baseData } = store.getState();
    let { departments } = baseData;
    let { locations } = baseData;
    let { divisions } = baseData;
    let { majors } = baseData;
    data.map((task, index) => {
        let taskRow = [];
        Object.keys(header).map(key => {
           
            switch (key) {
                case 'no':
                    taskRow.push(`${index + 1}`);
                    break;
                case 'staff_code':
                    let code = '';
                    if (task.staff && task.staff.length) {
                        task.staff.map(s => {
                            if (s.info) {
                                code += s.info.code + '\n';
                            }
                        });
                    }
                    taskRow.push(code);
                    break;
                case 'name':
                    taskRow.push(task.name);
                    break;
                case 'department':
                    let departmentName = '';
                    let dataDepartmentId = task.department_ids ;                    
                    
                    if(dataDepartmentId.length == 1){                        
                        dataDepartmentId.map(r =>{     
                            departments.map(d=>{                           
                                if(r==d.id){                               
                                  return  departmentName = d.name                               
                                }                                
                            })                           
                        })
                        taskRow.push(departmentName); 
                    }
                    else{
                        taskRow.push('Nhiều chi nhánh'); 
                    }
                    break;
                case 'division':
                    let divisionName = '';
                    let dataDivisionId = task.division_ids ;                    
                    
                    if(dataDivisionId.length == 1){                        
                        dataDivisionId.map(r =>{     
                            divisions.map(d=>{                           
                                if(r==d.id){                               
                                  return  divisionName = d.name                               
                                }
                                else{
                                    return divisionName = 'chưa có dữ liệu bộ phận cho nhân viên này'
                                }                                
                            })                           
                        })
                        taskRow.push(divisionName); 
                    }
                    else{
                        taskRow.push('Nhiều bộ phận'); 
                    }

                    
                    break;
                case 'major':
                    let majorName = '';
                    let dataMajorId = task.major_ids ; 
                    if(dataMajorId.length == 1){                        
                        dataMajorId.map(r =>{     
                            majors.map(d=>{                           
                                if(r==d.id){                               
                                  return  majorName = d.name                               
                                }                                
                            })                           
                        })
                        taskRow.push(majorName); 
                    }
                    else{
                        taskRow.push('Đảm nhận nhiều vị trí'); 
                    }
                    break;
                case 'location':             
                    let locationName = '';
                    let dataLocationId = task.location_ids ;                    
                    
                    if(dataLocationId.length == 1){                        
                        dataLocationId.map(r =>{     
                            locations.map(d=>{                           
                                if(r==d.id){                               
                                return  locationName = d.name                               
                                }                                
                            })                           
                        })
                        taskRow.push(locationName); 
                    }
                    else{
                        taskRow.push('hỗn hợp nhiều chi nhánh'); 
                    }
                    break;
                case 'project_name':
                    taskRow.push(task?.project?.name);
                    break;
                case 'code':
                    taskRow.push(task.code);
                    break;
               
                case 'amount_of_work':
                    taskRow.push(task.amount_of_work);
                    break;
               
                case 'staff_name':
                    let assign = '';
                    if (task.staff && task.staff.length) {
                        task.staff.map(s => {
                            if (s.info) {
                                assign += s.info.staff_name + '\n';
                            }
                        });
                    }
                    taskRow.push(assign);
                    break;
                case 'date_start':
                    taskRow.push(timeFormatStandard(task.date_start, dateFormat));
                    break;
                case 'updated_at':
                    taskRow.push(timeFormatStandard(task.updated_at,'YYYY-MM-DD HH:mm'));
                    break;
                case 'planned_hours':
                    taskRow.push(task.planned_hours);
                    break;
                case 'date_end':
                    //console.log(task)
                    if(task.date_end){
                        taskRow.push(timeFormatStandard(task.date_end, dateFormat));
                    }
                    else{
                        taskRow.push('')
                    }
                    
                    break;
                case 'reality_date':
                    taskRow.push(timeFormatStandard(task.date_end, dateFormat));
                    break;
                case 'status':
                    taskRow.push(projectTaskStatus[task.status]);
                    break;
                case 'progress':
                    taskRow.push(projectTaskProgress[task.progress]);
                    break;
                case 'reality_hours':
                    taskRow.push(task.confirm_hours);
                    break;
                case 'confirm_hours':
                    taskRow.push(task.confirm_hours);
                    break;
                
                default:
                    taskRow.push('');
                    break;
            }
        });
        result.push([...taskRow]);
    })

    return [...result];
}
export const stylesHistory = {

    row: {
        1: {
            width: 10, 
            height: 20, 
            font: { bold: true }, 
            alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
            
        }
    },
    col: {
        1: { width: 7,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        2: { width: 15,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        3: { width: 25,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        4: { width: 20,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        5: { width: 20,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        6: { width: 20,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        7: { width: 20,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        8: { width: 20,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        9: { width: 15,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        10: { width: 40,  alignment: { vertical: 'middle', horizontal: 'left', wrapText: true},},
        11: { width: 20,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        12: { width: 20,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        13: { width: 20,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        14: { width: 20,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        15: { width: 20,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        16: { width: 15,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        17: { width: 15,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        18: { width: 15,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        19: { width: 15,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        20: { width: 15,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
        21: { width: 15,  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true},},
      
    }
}

export default {
    getHeader,
    formatData
}