

import StaffRelationship from '~/scenes/Company/Staff/StaffRelationship';

export default [
    {
        key: 'company.staff.relationship',
        name: 'Skill',
        component: StaffRelationship,
        path: '/company/staff/:id/relationship',
        template: 'main',
        hide: true
    },
];