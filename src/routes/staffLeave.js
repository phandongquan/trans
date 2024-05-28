import React from 'react';
import StaffLeave from '~/scenes/Company/StaffLeave';
import StaffLeaveForm from '~/scenes/Company/StaffLeave/StaffLeaveForm';
import StaffLeaveFormCustom from '~/scenes/Company/StaffLeave/StaffLeaveFormCustom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileContract } from '@fortawesome/free-solid-svg-icons'

export default [
    {
        key: 'company.staff-leave',
        name: 'Staff Leave',
        component: StaffLeave,
        path: '/company/staff-leave',
        template: 'main',
        icon: <span className='icon_menu icon_staff_leave'></span>,
        // permission: 'company-staff-leave-list'
        permission:'hr-staff-leave-list'
    },
    {
        key: 'company.staff-leave.create',
        name: 'Staff Leave Create',
        component: StaffLeaveForm,
        path: '/company/staff-leave/create',
        template: 'main',
        hide: true
    },
    {
        key: 'company.staff-leave.create-custom',
        name: 'Staff Leave Create Custom',
        component: StaffLeaveFormCustom,
        path: '/company/staff-leave/create-custom',
        template: 'main',
        hide: true
    },
    {
        key: 'company.staff-leave.edit',
        name: 'Staff Leave Edit',
        component: StaffLeaveForm,
        path: '/company/staff-leave/:id/edit',
        template: 'main',
        hide: true,
        permission:'hr-staff-leave-list'
    },
    {
        key: 'company.staff-leave.edit-custom',
        name: 'Staff Leave Edit Custom',
        component: StaffLeaveFormCustom,
        path: '/company/staff-leave/create-custom/:id/edit',
        template: 'main',
        hide: true
    },
];