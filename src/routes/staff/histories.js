

import StaffHistory from '~/scenes/Company/Staff/StaffHistory';

export default [
    {
        key: 'company.staff.history',
        name: 'History',
        component: StaffHistory,
        path: '/company/staff/:id/history',
        template: 'main',
        hide: true,
        permission: 'hr-staff-history-list'
    },
];