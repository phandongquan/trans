

import StaffSpecialized from '~/scenes/Company/Staff/StaffSpecialized';

export default [
    {
        key: 'company.staff.specialized',
        name: 'Specialized',
        component: StaffSpecialized,
        path: '/company/staff/:id/specialized',
        template: 'main',
        hide: true,
        permission: 'hr-staff-detail-specialized-list'
        // permission: 'check_required',
        // requiredDivisions: [115], // HR
        // requiredManagerHigher: true
    },
];