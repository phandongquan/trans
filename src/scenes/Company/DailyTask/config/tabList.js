// export default [
//     {
//         title: 'Report',
//         route: '/company/daily-task',
//     },
//     {
//         title: 'Task',
//         route: '/company/daily-task/task'
//     },
//     {
//         title: 'Checklist',
//         route: '/company/daily-task/workflow'
//     },
//     {
//         title: 'Diagram Store',
//         route: '/diagram-store'
//     },
//     {
//         title: 'SKU check-list',
//         route: '/company/daily-task/sku-checklist'
//     },
//     {
//         title: 'SKU trưng bày ngoài kệ',
//         route: '/company/daily-task/sku-checklist-daily'
//     },
//     {
//         title: 'History verify',
//         route: '/company/daily-task/history-verify'
//     },
//     {
//         title: 'Lịch sử ra vào cửa hàng',
//         route: '/company/daily-task/History-of-store-traffic'
//     }
// ];

import { checkPermission } from "~/services/helper";

export default function (props){
    const { t } = props;
    let result = [];
    if (checkPermission('hr-daily-task-report-list')) {
        result.push({
            title: t('report'),
            route: '/company/daily-task',
        })
    }
    if (checkPermission('hr-daily-task-list'))
        result.push({
            title: t('task'),
            route: '/company/daily-task/task'
        })
    if (checkPermission('hr-daily-task-checklist-list'))
        result.push({
            title: t('checklist'),
            route: '/company/daily-task/workflow'
        })
    if (checkPermission('hr-daily-task-diagram-store-list'))
        result.push({
            title: t('diagram_store'),
            route: '/diagram-store'
        })
    if (checkPermission('hr-daily-task-sku-checklist-list'))
        result.push({
            title: t('hr:sku_checklist'),
            route: '/company/daily-task/sku-checklist'
        })
    if (checkPermission('hr-daily-task-sku-checklist-list'))
        result.push({
            title: t('hr:sku_display_shelf'),
            route: '/company/daily-task/sku-checklist-daily'
        })
    if (checkPermission('hr-daily-task-history-verify-list'))
        result.push({
            title: t('hr:verify_history'),
            route: '/company/daily-task/history-verify'
        })
    if (checkPermission('hr-history-in-out-store-list'))
        result.push({
            title: t('store_access_history'),
            route: '/company/daily-task/History-of-store-traffic'
        })
    return result;
}