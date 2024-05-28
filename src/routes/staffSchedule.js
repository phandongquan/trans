import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarWeek } from '@fortawesome/free-solid-svg-icons'
import StaffSchedule from '~/scenes/Company/StaffSchedule';
import StaffScheduleForm from '~/scenes/Company/StaffSchedule/staffScheduleForm';
import Daily from '~/scenes/Company/StaffSchedule/Daily';
import Report from '~/scenes/Company/StaffSchedule/Report';
import ImportForm from '~/scenes/Company/StaffSchedule/ImportForm';
import ConfigSchedule from '~/scenes/Company/StaffSchedule/ScheduleConfig';
import ConfigScheduleForm from '~/scenes/Company/StaffSchedule/ScheduleConfig/ConfigForm';
import DayOff from '~/scenes/Company/StaffSchedule/DayOff/index';
import DayOffForm from '~/scenes/Company/StaffSchedule/DayOff/form';
import  ManpowerAllocationForm  from '~/scenes/Company/StaffSchedule/ManpowerAllocation/form';
import ManpowerAllocation from '~/scenes/Company/StaffSchedule/ManpowerAllocation';
import { checkPermission, checkPermissionParentRoute } from '~/services/helper';
import StaffScheduleDrashboard from '~/scenes/Company/StaffSchedule/Dashboard'
export default [
    {
        key: 'company.staff-schedule',
        name: 'Staff Schedule',
        component: StaffSchedule,
        path: '/company/staff-schedule',
        template: 'main',
        icon: <span className='icon_menu icon_schedule'></span>,
        permissionOfChild: ['hr-staff-schedule-monthly-list', 'hr-staff-schedule-daily-list', 'hr-staff-schedule-report-list', 'hr-staff-schedule-allocation-list'],
        // permission: ['hr-staff-schedule-monthly-list', 'hr-staff-schedule-daily-list', 'hr-staff-schedule-report-list', 'hr-staff-schedule-allocation-list'],
        children: [
            {
                key: 'company.staff-schedule.monthly',
                name: 'Staff Schedule',
                component: StaffSchedule,
                path: '/company/staff-schedule/monthly',
                template: 'main',
                permission: 'hr-staff-schedule-monthly-list',
            },
            {
                key: 'company.staff-schedule.daily',
                name: 'Schedule Daily',
                component: Daily,
                path: '/company/staff-schedule/daily',
                template: 'main',
                // hide: true,
                permission: 'hr-staff-schedule-daily-list'
            },
            {
                key: 'company.staff-schedule.report',
                name: 'Schedule Report',
                component: Report,
                path: '/company/staff-schedule/report',
                template: 'main',
                // hide: true,
                permission: 'hr-staff-schedule-report-list'
            },
            {
                key: 'company.staff-schedule.manpower-allocation',
                name: 'Schedule Manpower Allocation',
                component: ManpowerAllocation,
                path: '/company/staff-schedule/manpower-allocation',
                template: 'main',
                // hide: true,
                permission: 'hr-staff-schedule-allocation-list'
                
            },
            {
                key: 'company.staff-schedule.dashboard',
                name: 'Schedule Dashboard',
                component: StaffScheduleDrashboard,
                path: '/company/staff-schedule/dashboard',
                template: 'main',
                // hide: true,
                permission: 'hr-staff-schedule-allocation-list'
                
            },
        ]
    },
    {
        key: 'company.staff.schedule.create',
        name: 'Staff Schedule Create',
        component: StaffScheduleForm,
        path: '/company/staff-schedule/create',
        template: 'main',
        hide: true
    },
    {
        key: 'company.staff.schedule.import',
        name: 'Staff Schedule Import',
        component: ImportForm,
        path: '/company/staff-schedule/import',
        template: 'main',
        hide: true
    },
    {
        key: 'company.staff.schedule.edit',
        name: 'Staff Schedule Edit',
        component: StaffScheduleForm,
        path: '/company/staff-schedule/:id/edit',
        template: 'main',
        hide: true
    },
    {
        key: 'company.staff.schedule.config_schedule',
        name: 'Staff Config Schedule',
        component: ConfigSchedule,
        path: '/company/staff-schedule/config-schedule',
        template: 'main',
        hide: true,
    },
    {
        key: 'company.staff.schedule.config_schedule.create',
        name: 'Staff Config Schedule Create',
        component: ConfigScheduleForm,
        path: '/company/staff-schedule/config-schedule/create',
        template: 'main',
        hide: true
    },
    {
        key: 'company.staff.schedule.config_schedule.edit',
        name: 'Staff Config Schedule Edit',
        component: ConfigScheduleForm,
        path: '/company/staff-schedule/config-schedule/:id/edit',
        template: 'main',
        hide: true
    },
    {
        key: 'company.staff.schedule.day_off',
        name: 'Staff Schedule Day Off',
        component: DayOff,
        path: '/company/staff-schedule/day-off',
        template: 'main',
        hide: true,
    },
    {
        key: 'company.staff.schedule.day_off.edit',
        name: 'Staff Schedule Day Off',
        component: DayOffForm,
        path: '/company/staff-schedule/day-off/:id/edit',
        template: 'main',
        hide: true,
    },
    {
        key: 'company.staff.schedule.day_off.create',
        name: 'Staff Schedule Day Off',
        component: DayOffForm,
        path: '/company/staff-schedule/day-off/create',
        template: 'main',
        hide: true,
    },
    {
        key: 'company.staff.schedule.manpower_allocation.create',
        name: 'Staff Schedule Manpower Allocation',
        component: ManpowerAllocationForm,
        path: '/company/staff-schedule/Manpower Allocation/create',
        template: 'main',
        hide: true,
    },
];