// export default [
//     {
//         title: 'Timesheet',
//         route: `/company/timesheet`,
//     },
//     {
//         title: 'Import',
//         route: `/company/timesheet/import`,
//     },
//     {
//         title: 'Report',
//         route: `/company/timesheet/report`,
//     }

import { checkPermission } from "~/services/helper";

// ]
export default function(props){
    const { t } = props;
    let result = [];
    if (checkPermission('hr-timesheet-list')){
        result.push({
            title: t('hr:timesheet'),
            route: `/company/timesheet`,
        })
    }
    if (checkPermission('hr-timesheet-import-list')){
        result.push({
            title: t('hr:import'),
            route: `/company/timesheet/import`,
        })
    }
    if (checkPermission('hr-timesheet-report-list')){
        result.push({
            title: t('hr:report'),
            route: `/company/timesheet/report`,
        })
    }
    return result;  
}