import { checkPermission } from "~/services/helper";
// export default function (id_major , is_Manager){
//     let result = [
//         {
//                     title: 'Task Input',
//                     route: '/company/tasks/task-input'
//                 },
//                 {
//                     title: 'Workflows',
//                     route: '/company/workflows'
//                 },
//                 {
//                     title: 'Sheet Summary',
//                     route: '/company/tasks/sheet-summary'
//                 },
//                 {
//                     title: 'Task Suggest',
//                     route: '/company/tasks/suggest'
//                 },
//                 {
//                     title: 'Location Config KPI',
//                     route: '/company/location-config-kpi'
//                 },
//                 {
//                     title: 'Task Schedule',
//                     route : '/company/tasks/schedule'
//                 },
//                 {
//                     title: 'Management Area',
//                     route : '/company/task/management-locations'
//                 },
//                 {
//                     title : 'Majors Management',
//                     route : '/company/task/majors-management'
//                 }
//     ];
//     // id iso = 64
//     if(id_major == 64 || is_Manager) {
//         result.push({
//             title: 'Staff Groups',
//             route: `/company/staff-groups`,
//         })
//     }
//     if(checkPermission('hr-kpi-config-list')){
//         result.push({
//             title: 'KPI Config',
//             route : '/company/kpiconfig'
//         })
//     }
//     return result;
// }
export default function (props) {
    const { t } = props;
    let result = []; 
    if(checkPermission('hr-kpi-config-list')){
        result.push({
            title: t('hr:kpi_config'),
            route : '/company/kpiconfig'
        })
    }

    if (checkPermission('hr-staff-group-list')) {
        result.unshift({
            title: t('hr:staff_group'),
            route: `/company/staff-groups`,
        })
    }
    if (checkPermission('hr-majors-management-list')) {
        result.unshift({
            title: t('hr:major_managerment'),
            route: '/company/task/majors-management'
        })
    }
    if (checkPermission('hr-management-locations-list')) {
        result.unshift({
            title: t('hr:management_area'),
            route: '/company/task/management-locations'
        })
    }
    if (checkPermission('hr-task-schedule-list')) {
        result.unshift({
            title: t('hr:task_schedule'),
            route: '/company/tasks/schedule'
        })
    }
    if (checkPermission('hr-location-config-kpi-list')) {
        result.unshift({
            title: t('hr:location_kpi_config'),
            route: '/company/location-config-kpi'
        })
    }
    if (checkPermission('hr-task-suggest-list')) {
        result.unshift({
            title: t('hr:task_suggest'),
            route: '/company/tasks/suggest'
        })
    }
    if (checkPermission('hr-sheet-summary-list')) {
        result.unshift({
            title: t('hr:sheet_summary'),
            route: '/company/tasks/sheet-summary'
        })
    }
    if (checkPermission('hr-workflow-list')) {
        result.unshift({
            title: t('hr:workflow'),
            route: '/company/workflows'
        })
    }
        result.unshift({
            title: t('hr:report_task'),
            route: '/company/tasks/report-task'
        })
    if (checkPermission('hr-task-input-list')) {
        result.unshift({
            title: t('hr:task_input'),
            route: '/company/tasks/task-input'
        })
    }
    return result;
}