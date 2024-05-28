import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons'
import Auth from '~/routes/auth';
import Dashboard from '~/scenes/Dashboard';
import ExcelIOLogs from '~/scenes/ExcelIOLogs';
import Errors from './errors';
import Reports from './reports';
import skillRoute from '~/routes/skill.js';
import staffRoute from '~/routes/staff.js';
import trainingQuestion from '~/routes/trainningQuestion';
import trainingExamination from '~/routes/trainingExamination';
import documentRoute from '~/routes/document';
import TaskRoute from '~/routes/task/index.js';
import Communication from '~/routes/communication';
import JobRoute from '~/routes/job';
import StaffLeave from '~/routes/staffLeave';
import Timesheet from '~/routes/timesheet';
import StaffSchedule from '~/routes/staffSchedule';
import NewRoute from '~/routes/new';
import tools from './tool';
import dailyTask from './dailyTask';
import assetDevice from './assetDevice';
import feedback from './feedback';
import logMusicRouter from './logMusic';
import trainingPlanRouter from '~/routes/trainingPlan';
import setting from './setting';
export default [
    {
        key: 'dashboard',
        name: 'Dashboard',
        component: () => <Dashboard />,
        path: '/',
        hide: true,
        icon: <FontAwesomeIcon icon={faTachometerAlt} />,
        template: 'main',
    },
    {
        key: 'excel-io-logs',
        name: 'Excel IO Logs',
        component: () => <ExcelIOLogs />,
        path: '/excel-io-logs',
        hide: true,
        icon: <FontAwesomeIcon icon={faTachometerAlt} />,
        template: 'main',
    },
    ...Auth,
    ...Errors,
    ...StaffSchedule,
    ...StaffLeave,
    ...staffRoute,
    ...skillRoute,
    ...trainingQuestion,
    ...trainingExamination,
    // ...trainingPlan,
    ...Timesheet,
    ...documentRoute,
    ...JobRoute,
    ...NewRoute,
    ...TaskRoute,
    ...Communication,
    ...Reports,
    ...dailyTask,
    ...assetDevice,
    ...feedback,
    ...logMusicRouter,
    ...tools,
    ...setting,
    // ...qrCode,
    ...trainingPlanRouter
];
