import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';

import Project from '~/scenes/Company/Project';
import ProjectDetail from '~/scenes/Company/Project/ProjectDetail';
import MyTasks from '~/scenes/Company/Project/MyTasks';
import Report from '~/scenes/Company/Project/Report';
import ReportStaff from '~/scenes/Company/Project/ReportStaff';
import Permission from '~/scenes/Company/Project/Permission';
import ProjectDetailGantt from '~/scenes/Company/Project/ProjectDetailGantt';

export default [
    {
        key: 'company.projects',
        name: 'Project',
        component: Project,
        path: '/company/projects',
        template: 'main',
        icon: <FontAwesomeIcon icon={faArchive} />,
        permission: 'company-task'
    },
    {
        key: 'company.projects.detail',
        name: 'Project Detail',
        component: ProjectDetail,
        path: '/company/projects/:id/edit',
        template: 'main',
        hide: true
    },
    {
        key: 'company.projects.mytasks',
        name: 'My Tasks',
        component: MyTasks,
        path: '/company/projects/mytasks',
        template: 'main',
        hide: true
    },
    {
        key: 'company.projects.report',
        name: 'Report Staff',
        component: Report,
        path: '/company/projects/report',
        template: 'main',
        hide: true
    },
    {
        key: 'company.projects.report-staff',
        name: 'Report Staff',
        component: ReportStaff,
        path: '/company/projects/report-staff',
        template: 'main',
        hide: true
    },
    {
        key: 'company.projects.permission',
        name: 'Permission By Project',
        component: Permission,
        path: '/company/projects/:id/permission',
        template: 'main',
        hide: true
    },
    {
        key: 'company.projects.detailgantt',
        name: 'Detail Gantt',
        component: ProjectDetailGantt,
        path: '/company/projects/detailgantt/:id',
        template: 'main',
        hide: true
    }
];