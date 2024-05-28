// export default [
//     {
//         title: 'Staff',
//         route: '/company/staff/list',
//     },
//     {
//         title: 'Staff Need Approve',
//         route: '/company/staff/need-approve'
//     },
//     {
//         title: 'Staff History',
//         route: '/company/staff/history'
//     },
//     {
//         title: 'Report Staff',
//         route: '/company/staff/reports'
//     },
//     {
//         title: 'Staff Specialized',
//         route: '/company/staff/specialized-list'
//     }
// ];


import { checkPermission } from "~/services/helper";

export default function (props) {
    const { t } = props;
    let result = [];
    if (checkPermission('hr-staff-list')){
        result.push({
            title: t('staff'),
            route: '/company/staff/list',
        })
    }
    if (checkPermission('hr-staff-need-approve-list')) {
        result.push({
            title: t('staff_need_approve'),
            route: '/company/staff/need-approve'
        })
    }
    if (checkPermission('hr-staff-history-list')) {
        result.push({
            title: t('staff_history'),
            route: '/company/staff/history'
        })
    }
    if (checkPermission('hr-report-staff-list')) {
        result.push({
            title: t('hr:report_staff'),
            route: '/company/staff/reports'
        })
    }
    if (checkPermission('hr-staff-specialized-list')) {
        result.push({
            title:t('hr:staff_specialized'),
            route: '/company/staff/specialized-list'
        })
    }
    return  result;
}
