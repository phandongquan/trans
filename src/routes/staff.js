import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { Redirect } from 'react-router-dom'
// Staff children Route
import histories from './staff/histories';
import relationship from './staff/relationship';
import specialized from './staff/specialized';
import practising from './staff/practising-certificate';
import skill from './staff/skill';
import needApprove from './staff/need-approve';
import listHistoy from './staff/list-history'
import salaryConfig from './staff/salary-config';
import trainingPlan from './trainingPlan';

// component scenes
import Staff from '~/scenes/Company/Staff';
import StaffForm from '~/scenes/Company/Staff/StaffForm';
import StaffPrint from '~/scenes/Company/Staff/StaffPrint';
import StaffNeedApprove from '~/scenes/Company/Staff/StaffNeedApprove';
import StaffHistoryList from '~/scenes/Company/Staff/StaffHistoryList';
import reportStaff from '~/scenes/Reports/Staff';
import Adjustment from '~/scenes/Company/Adjustment';
import StaffSpecializedList from '~/scenes/Company/Staff/StaffSpecializedList';
import { checkPermission } from '~/services/helper';
import TrainingPlanStaff from "~/scenes/Company/TrainingPlan/TrainingPlanStaff";
import EmployeePerformance from '~/scenes/Company/Employee/EmployeePerformance';
import ExternalAccount from '~/scenes/Company/Staff/ExternalAccount';
import StaffBalance from '~/scenes/Company/Staff/StaffBalance';


export default [
    {
        key: 'company.staff',
        name: 'Staff',
        component: () => <Redirect exact to='/sales/404' />,
        path: '/company',
        template: 'main',
        icon: <span className='icon_menu icon_staff'></span>,
        permissionOfChild: ['hr-staff-list', 'hr-staff-need-approve-list', 'hr-staff-history-list', 'hr-report-staff-list', 'hr-staff-specialized-list'],
        // permission: 'company-staff-list',
        // requiredDepts: [100], // Deparments [BOD]
        // requiredDivisions: [115], // Divisions [Hr]
        children: [
            {
                key: 'company.staff.list',
                name: 'Staff',
                component: Staff,
                path: '/company/staff/list',
                template: 'main',
                // permission: 'company-staff-list',
                // requiredDepts: [100], // Deparments [BOD]
                // requiredDivisions: [115], // Divisions [Hr]
                permission: 'hr-staff-list',

            },
            {
                key: 'company.staff.need-approve',
                name: 'Staff Need Approve',
                component: StaffNeedApprove,
                path: '/company/staff/need-approve',
                template: 'main',
                permission: 'hr-staff-need-approve-list'
            },
            {
                key: 'company.staff.history',
                name: 'Staff History',
                component: StaffHistoryList,
                path: '/company/staff/history',
                template: 'main',
                permission: 'hr-staff-history-list'
            },
            {
                key: 'company.staff.reports',
                name: 'Report Staff',
                component: reportStaff,
                path: '/company/staff/reports',
                template: 'main',
                permission: 'hr-report-staff-list',
            },
            {
                key: 'company.staff.specialized-list',
                name: 'Staff Specializeded List',
                component: StaffSpecializedList,
                path: '/company/staff/specialized-list',
                template: 'main',
                // permission: 'check_required',
                // requiredDivisions: [115], // HR
                // requiredManagerHigher: true
                permission: 'hr-staff-specialized-list',

            },
        ]
    },
    {
        key: 'company.staff.create',
        name: 'Staff Add New',
        component: StaffForm,
        path: '/company/staff/create',
        template: 'main',
        hide: true,
        permission: 'company-staff-list',
        // requiredDepts: [100], // Deparments [BOD]
        // requiredDivisions: [115], // Divisions [Hr]
    },
    {
        key: 'company.staff.edit',
        name: 'Staff Edit',
        component: StaffForm,
        path: '/company/staff/:id/edit',
        template: 'main',
        hide: true,
        permission: 'hr-staff-update'
        // permission: 'company-staff-list',
        // requiredDepts: [100], // Deparments [BOD]
        // requiredDivisions: [115], // Divisions [Hr]
    },
    {
        key: 'company.staff.print',
        name: 'Staff Print',
        component: StaffPrint,
        path: '/company/staff/:id/print',
        template: 'main',
        hide: true
    },
    {
        key: 'company.staff.adjustment',
        name: 'Staff Adjustment',
        component: Adjustment,
        path: '/company/staff/:id/adjustment',
        template: 'main',
        hide: true
    },
    {
        key: 'company.staff.balance',
        name: 'Balance',
        component: StaffBalance,
        path: '/company/staff/:id/balance',
        template: 'main',
        hide: true 
    },
    {
        key: 'company.staff.performance',
        name: 'Employee Performance',
        component: EmployeePerformance,
        path: '/company/staff/:id/performance',
        template: 'main',
        hide: true
    },
    {
        key: 'company.staff.externalaccount',
        name: 'Staff External Account',
        component: ExternalAccount,
        path: '/company/staff/:id/external-account',
        template: 'main',
        hide: true
    },

    ...needApprove,
    ...listHistoy,
    ...skill,
    ...histories,
    ...relationship,
    ...specialized,
    // ...practising,
    ...salaryConfig,
    ...trainingPlan
];