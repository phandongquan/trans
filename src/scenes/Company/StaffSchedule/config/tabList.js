// export default [
//     {
//         title: 'Monthly',
//         route: `/company/staff-schedule`,
//     },
//     {
//         title: 'Daily',
//         route: `/company/staff-schedule/daily`,
//     },
//     {
//         title: 'Report',
//         route: `/company/staff-schedule/report`,
//     },
//     // {
//     //     title: 'Day Off',
//     //     route: `/company/staff-schedule/day-off`,
//     // },
//     // {
//     //     title: 'Config Schedule',
//     //     route: `/company/staff-schedule/config-schedule`,
//     // },
//     {
//         title : 'Manpower Allocation',
//         route: `/company/staff-schedule/manpower-allocation`,
//     }
// ]
import { checkPermission } from "~/services/helper";

export default function (props) {
    const { t } = props;
    let result = [];
    if (checkPermission('hr-staff-schedule-monthly-list')){
        result.push({
            title: t('hr:monthly'),
            route: `/company/staff-schedule/monthly`,
        })
    }
    if (checkPermission('hr-staff-schedule-daily-list')){
        result.push({
            title: t('hr:daily'),
            route: `/company/staff-schedule/daily`,
        })
    }
    if (checkPermission('hr-staff-schedule-report-list')){
        result.push({
            title: t('hr:report'),
            route: `/company/staff-schedule/report`,
        })
    }
    if (checkPermission('hr-staff-schedule-allocation-list')){
        result.push({
            title: t('hr:manpower_allocation'),
            route: `/company/staff-schedule/manpower-allocation`,
        })
    }
    if (checkPermission('hr-staff-schedule-allocation-list')){
        result.push({
            title: t('hr:Dashboard'),
            route: `/company/staff-schedule/dashboard`,
        })
    }
    return result;
}