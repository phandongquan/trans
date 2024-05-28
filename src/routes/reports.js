import React from 'react';
import { Redirect } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faChartArea } from '@fortawesome/free-solid-svg-icons'
import Staff from '~/scenes/Reports/Staff';

export default [
    {
        key: 'reports',
        name: 'Reports',
        component: () => <Redirect exact to='/sales/404' />,
        path: '/report',
        icon: <FontAwesomeIcon icon={faChartArea} />,
        children: [
            {
                key: 'company.staff.report',
                name: 'Staff',
                component: Staff,
                path: 'company/staff/reports',
                template: 'main',
                icon: <FontAwesomeIcon icon={faUsers} />,
                // permission: 'sales-order-list',
                hide: true
            },
        ],
        hide: true
    }
]