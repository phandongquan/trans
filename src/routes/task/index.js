import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Workflow from '~/scenes/Company/Task/Workflow';
import WorkflowForm from '~/scenes/Company/Task/Workflow/WorkflowForm';
import { faTasks } from '@fortawesome/free-solid-svg-icons';
import TasksInput from '~/scenes/Company/Project/TasksInput';
import SheetSummary from '~/scenes/Company/SheetSummary';
import TaskSuggestName from '~/scenes/Company/Task/TaskSuggestName/TaskSuggestName';
import TaskSuggestForm from '~/scenes/Company/Task/TaskSuggestName/TaskSuggestForm';
import StaffGroup from '~/scenes/Company/StaffGroup';
import StaffGroupForm from '~/scenes/Company/StaffGroup/StaffGroupForm';
import LocationKpiConfig from '~/scenes/Company/Task/LocationKpiConfig';
import TaskSchedule from '~/scenes/Company/Task/TaskSchedule';
import ConfigCategory from '~/scenes/Company/Task/Workflow/ConfigCategory';
import StaffManagement from '~/scenes/Company/Staff/StaffManagement';
import kpiConfig from './kpiConfig';
import MajorsManagement from '~/scenes/Company/Task/MajorsManagement';
import KpiConfig from "~/scenes/Company/Task/KpiConfig";
import ReportTask from '../../scenes/Company/Task/ReportTask';

export default [
    {
        key: 'company.tasks.tasks-input',
        name: 'Tasks Input',
        component: TasksInput,
        path: '/company/tasks/task-input',
        template: 'main',
        icon: <span className='icon_menu icon_task'></span>,
        // permission: 'company-task'
        permissionOfChild: ['hr-task-input-list', 'hr-workflow-list', 'hr-sheet-summary-list', 'hr-task-suggest-list', 'hr-location-config-kpi-list', 'hr-task-schedule-list', 'hr-kpi-config-list'],
        children: [
            {
                key: 'company.tasks.tasks-input',
                name: 'Tasks Input',
                component: TasksInput,
                path: '/company/tasks/task-input',
                template: 'main',
                // permission: 'company-task'
                permission: 'hr-task-input-list'
            },
            {
                key: 'company.tasks.report-task',
                name: 'Report Task',
                component: ReportTask,
                path: '/company/tasks/report-task',
                template: 'main',
            },
            {
                key: 'company.workflows',
                name: 'Workflows',
                component: Workflow,
                path: '/company/workflows',
                template: 'main',
                // hide: true,
                permission: 'hr-workflow-list'
            },
            {
                key: 'company.tasks.sheet-summary',
                name: 'Sheet Summary',
                component: SheetSummary,
                path: '/company/tasks/sheet-summary',
                template: 'main',
                // hide: true,
                permission: 'hr-sheet-summary-list'
            },
            {
                key: 'company.tasks.suggest',
                name: 'Task Suggest',
                component: TaskSuggestName,
                path: '/company/tasks/suggest',
                template: 'main',
                // hide: true,
                permission: 'hr-task-suggest-list'
            },
            {
                key: 'company.location-config-kpi',
                name: 'Location KPI Config',
                component: LocationKpiConfig,
                path: '/company/location-config-kpi',
                template: 'main',
                // hide: true,
                permission: 'hr-location-config-kpi-list'
            },
            {
                key: 'company.tasks.schedule',
                name: 'Task Schedule',
                component: TaskSchedule,
                path: '/company/tasks/schedule',
                template: 'main',
                // hide: true,
                permission: 'hr-task-schedule-list'
            },
            {
                key: 'company.task.management-locations',
                name: 'Staff Management',
                component: StaffManagement,
                path: '/company/task/management-locations',
                template: 'main',
                hide: true,
                permission: 'hr-management-area-list'
            },
            {
                key: 'company.task.majors-management',
                name: 'Major Management',
                component: MajorsManagement,
                path: '/company/task/majors-management',
                template: 'main',
                hide: true
            },
            {
                key: 'company.staff-groups',
                name: 'Staff Groups',
                component: StaffGroup,
                path: '/company/staff-groups',
                template: 'main',
                hide: true,
                permission: 'hr-staff-group-list'
            },
            {
                key: "company.kpiconfig",
                name: "KPI Config",
                component: KpiConfig,
                path: "/company/kpiconfig",
                template: "main",
                // hide: true,
                // permission: 'company-staff-list',
                // requiredStaffIds: ['5900'] // thamnn
                permission: 'hr-kpi-config-list',
            },
        ]

    },
    {
        key: 'company.workflows.config-category',
        name: 'Workflows Config Category',
        component: ConfigCategory,
        path: '/company/workflows/config-category',
        template: 'main',
        hide: true,
    },
    {
        key: 'company.workflows.edit',
        name: 'Workflow Edit',
        component: WorkflowForm,
        path: '/company/workflows/:id/edit',
        template: 'main',
        hide: true,
        // permission:'hr-workflow-update'
    },
    {
        key: 'company.workflows.create',
        name: 'Workflow Create',
        component: WorkflowForm,
        path: '/company/workflows/create',
        template: 'main',
        hide: true,
        permission:'hr-workflow-create'
    },
    {
        key: 'company.task.suggest-create',
        name: 'Suggest Task Create',
        component: TaskSuggestForm,
        path: '/company/tasks/suggest-create',
        template: 'main',
        hide: true,
        permission:'hr-task-suggest-create'
    },
    {
        key: 'company.task.suggest-edit',
        name: 'Suggest Task Edit',
        component: TaskSuggestForm,
        path: '/company/tasks/suggest/:id/edit',
        template: 'main',
        hide: true,
        permission: 'hr-task-suggest-list'
    },
    
    {
        key: 'company.staff-group-create',
        name: 'Staff Group Create',
        component: StaffGroupForm,
        path: '/company/staff-group/create',
        template: 'main',
        hide: true,
    },
    {
        key: 'company.staff-group-edit',
        name: 'Suggest Task Edit',
        component: StaffGroupForm,
        path: '/company/staff-group/:id/edit',
        template: 'main',
        hide: true
    },
   
    {
        key: 'company.task.schedule-edit',
        name: 'Suggest Task Schedule Edit',
        component: TaskSuggestForm,
        path: '/company/tasks/schedule/:id/edit',
        template: 'main',
        hide: true
    },
    {
        key: 'company.task.majors-management',
        name: 'Major Management',
        component: MajorsManagement,
        path: '/company/task/majors-management',
        template: 'main',
        hide: true,
        permission: 'hr-majors-management-list'
    },
    ...kpiConfig
];