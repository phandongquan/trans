import React from 'react';
import { Redirect } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserClock } from '@fortawesome/free-solid-svg-icons'
import DailyTask from '~/scenes/Company/DailyTask'
import Workflow from '~/scenes/Company/DailyTask/Workflow'
import WorkflowForm from '~/scenes/Company/DailyTask/Workflow/WorkflowForm'
import Task from '~/scenes/Company/DailyTask/Task'
import TaskForm from '~/scenes/Company/DailyTask/Task/TaskForm';
import DailyTaskReportLog from '~/scenes/Company/DailyTask/ReportLog';
import DailyTaskReportLogFilter from '~/scenes/Company/DailyTask/ReportLog/TaskLogFilter';
import DailyTaskReportLogDetail from '~/scenes/Company/DailyTask/ReportLog/TaskLogDetail';
import diagramStore from './diagramStore';
import SkuChecklist from '~/scenes/Company/DailyTask/SkuChecklist';
import { majorAreaManager, majorStoreManager } from '~/constants/basic';
import VerifyHistory from '~/scenes/Company/DailyTask/VerifyHistory';
import ListDetail from '~/scenes/Company/DailyTask/VerifyHistory/ListDetail';
import HistoryofStoreTraffic from '~/scenes/Company/DailyTask/HistoryofStoreTraffic';
import SkuChecklistDaily from '~/scenes/Company/DailyTask/SkuChecklistDaily';
import DiagramStore from '~/scenes/DiagramStore';
// import  StaffConsultant  from '~/scenes/Company/DailyTask/Consultant';

export default [
    {
        key: 'company.daily-task',
        name: 'Daily Task',
        component: DailyTask,
        path: '/company/daily-task',
        template: 'main',
        icon: <span className='icon_menu icon_daily_task'></span>,
        // permission: 'company-task',
        // requiredMajors: [majorStoreManager, majorAreaManager],
        permissionOfChild: ['hr-daily-task-report-list','hr-daily-task-list','hr-daily-task-checklist-list','hr-daily-task-diagram-store-list','hr-daily-task-sku-checklist-list','hr-daily-task-history-verify-list','hr-history-in-out-store-list'],
        children: [
            {
                key: 'company.daily-task',
                name: 'Daily Task',
                component: DailyTask,
                path: '/company/daily-task',
                template: 'main',
                // permission: 'company-task',
                // requiredMajors: [majorStoreManager, majorAreaManager],
                permission: 'hr-daily-task-report-list',
            },
            {
                key: 'company.daily-task.task',
                name: 'Tasks',
                component: Task,
                path: '/company/daily-task/task',
                template: 'main',
                // hide: true,
                permission: 'hr-daily-task-list'
            },
            {
                key: 'company.daily-task.workflow',
                name: 'Checklist',
                component: Workflow,
                path: '/company/daily-task/workflow',
                template: 'main',
                // hide: true,
                permission: 'hr-daily-task-checklist-list'
            },
            {
                key: 'diagram-store',
                name: 'Diagram Store',
                component: DiagramStore,
                path: '/diagram-store',
                template: 'main',
                // hide: true,
                permission: 'hr-daily-task-diagram-store-list'
            },
            {
                key: 'company.daily-task.sku-checklist',
                name: 'Sku Checklist',
                component: SkuChecklist,
                path: '/company/daily-task/sku-checklist',
                template: 'main',
                // hide: true,
                permission: 'hr-daily-task-sku-checklist-list'
            },
            {
                key: 'company.daily-task.sku-checklist-daily',
                name: 'SKU trưng bày ngoài kệ',
                component: SkuChecklistDaily,
                path: '/company/daily-task/sku-checklist-daily',
                template: 'main',
                // hide: true,
                permission: 'hr-daily-task-sku-checklist-list'
            },
            {
                key: 'company.daily-task.history-verify',
                name: 'History Verify',
                component: VerifyHistory,
                path: '/company/daily-task/history-verify',
                template: 'main',
                // hide: true,
                permission: 'hr-daily-task-history-verify-list'
            },
            {
                key: 'company.daily-task.History-of-store-traffic',
                name: 'Lịch sử ra vào cửa hàng',
                component: HistoryofStoreTraffic,
                path: '/company/daily-task/History-of-store-traffic',
                template: 'main',
                // hide: true,
                permission: 'hr-history-in-out-store-list'
            },

        ]
    },
    {
        key: 'company.daily-task.workflow.edit',
        name: 'Workflow',
        component: WorkflowForm,
        path: '/company/daily-task/workflow/:id/edit',
        template: 'main',
        hide: true
    },
    {
        key: 'company.daily-task.workflow.create',
        name: 'Create Workflow',
        component: WorkflowForm,
        path: '/company/daily-task/workflow/create',
        template: 'main',
        hide: true
    },
    {
        key: 'company.daily-task.create',
        name: 'Task Create',
        component: TaskForm,
        path: '/company/daily-task/create',
        template: 'main',
        hide: true,
    },
    {
        key: 'company.daily-task.edit',
        name: 'Task Edit',
        component: TaskForm,
        path: '/company/daily-task/:id/edit',
        template: 'main',
        hide: true,
    },
    {
        key: 'company.daily-task.report-log.filter',
        name: 'Report Log Filter',
        component: DailyTaskReportLogFilter,
        path: '/company/daily-task/report-log/filter',
        template: 'main',
        hide: true,
    },
    {
        key: 'company.daily-task.report-log',
        name: 'Daily Task Report Log',
        component: DailyTaskReportLog,
        path: '/company/daily-task/report-log/:task_id',
        template: 'main',
        hide: true,
    },
    {
        key: 'company.daily-task.task-logdetail',
        name: 'Report Log Detail',
        component: DailyTaskReportLogDetail,
        path: '/company/daily-task/report-log/detail/:task_staff_id',
        template: 'main',
        hide: true,
    },
    ...diagramStore,
    {
        key: 'History-verify-detail',
        name: 'History Verify Detail',
        component: ListDetail,
        path: '/company/daily-task/history-verify/detail',
        template: 'main',
        hide: true,
    },
    {
        key: 'History-of-store-traffic',
        name: 'History Of Store Traffic',
        component: HistoryofStoreTraffic,
        path: '/company/daily-task/History-of-store-traffic',
        template: 'main',
        hide: true,
        permission:'hr-history-in-out-store-list'
    },
    // {
    //     key: 'Staff-Consultant',
    //     name: 'Staff Consultant',
    //     component: StaffConsultant,
    //     path: '/company/daily-task/staff-consultant',
    //     template: 'main',
    //     hide: true,
    // },

];