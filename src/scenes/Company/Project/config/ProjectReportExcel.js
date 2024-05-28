
import { dateFormat, projectTaskStatus, projectTaskPriority } from '~/constants/basic';
import { timeFormatStandard } from '~/services/helper';

export const header = {
    'no': 'No',
    'project_name': 'Dự án',
    'name': 'Công việc',
    'piority': 'Priority',
    'assign': 'Người thực hiện',
    'date_start': 'Start time',
    'date_end': 'Deadline',
    'duration': 'Duration',
    'kpi': 'Score',
    'status': 'Trạng thái',
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
    data.map((project, index) => {
        let no = String(index + 1);
        let row = [];
        Object.keys(header).map(key => {
            switch (key) {
                case 'no':
                    row.push(no);
                    break;
                case 'project_name':
                    row.push(project.name);
                    break;
                case 'status':
                    let projectStatus = '';
                    if (project.data) {
                        projectStatus = `${project.data.task_finished}/${project.data.task_total} Finished - `;
                        projectStatus += `${project.data.task_finished_per}%`;
                    }
                    row.push(projectStatus);
                    break;
                case 'assign':
                    let mainAssign = '';
                    if (project.main_assign && project.main_assign.length) {
                        project.main_assign.map(staff => {
                            mainAssign += staff.info.staff_name + '\n';
                        });
                    }
                    row.push(mainAssign);
                    break;
                default:
                    row.push('');
                    break;
            }
        });
        result.push([...row]);
        if (project.tasks) {
            project.tasks.map((task, taskIndex) => {
                let taskNo = String(taskIndex + 1);
                let taskRow = [];
                Object.keys(header).map(key => {
                    switch (key) {
                        case 'no':
                            taskRow.push(`${no}.${taskNo}`);
                            break;
                        case 'name':
                            taskRow.push(task.name);
                            break;
                        case 'status':
                            taskRow.push(projectTaskStatus[task.status]);
                            break;
                        case 'piority':
                            taskRow.push(projectTaskPriority[task.piority]);
                            break;
                        case 'assign':
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
                        case 'duration':
                            taskRow.push(task.duration);
                            break;
                        case 'date_start':
                            taskRow.push(timeFormatStandard(task.date_start, dateFormat));
                            break;
                        case 'date_end':
                            taskRow.push(timeFormatStandard(task.date_end, dateFormat));
                            break;
                        case 'kpi':
                            taskRow.push(task.kpi);
                            break;
                        default:
                            taskRow.push('');
                            break;
                    }
                });
                result.push([...taskRow]);
            });          
        }
    })

    return [...result];
}

export default {
    getHeader,
    formatData
}