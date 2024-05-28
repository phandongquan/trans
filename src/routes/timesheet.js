import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import Timesheet from '~/scenes/Company/Timesheet';
import TimesheetReport from '~/scenes/Company/Timesheet/Report';
import TimesheetImport from '~/scenes/Company/Timesheet/Import';

export default [
    {
        key: 'company.timesheet',
        name: 'Timesheet',
        component: Timesheet,
        path: '/company/timesheet',
        template: 'main',
        icon: <span className='icon_menu icon_time_sheet'></span>,
        // permission: 'company-timesheet-list'
        permissionOfChild: ['hr-timesheet-list', 'hr-timesheet-import-list', 'hr-timesheet-report-list'],
        children: [
            {
                key: 'company.timesheet',
                name: 'Timesheet',
                component: Timesheet,
                path: '/company/timesheet',
                template: 'main',
                // permission: 'company-timesheet-list'
                permission: 'hr-timesheet-list',
            },
            {
                key: 'company.timesheet.import',
                name: 'Import',
                component: TimesheetImport,
                path: '/company/timesheet/import',
                template: 'main',
                // hide: 'true',
                // permission: 'company-timesheet-import'
                permission: 'hr-timesheet-import-list'
            },
            {
                key: 'company.timesheet.report',
                name: 'Report',
                component: TimesheetReport,
                path: '/company/timesheet/report',
                template: 'main',
                // hide: true,
                // permission: 'company-timesheet-report'
                permission: 'hr-timesheet-report-list'
            }
        ]
    },
];