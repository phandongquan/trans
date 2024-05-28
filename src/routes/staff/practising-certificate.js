

import StaffPractisingCertificate from '~/scenes/Company/Staff/StaffPractisingCertificate';

export default [
    {
        key: 'company.staff.practising-certificate',
        name: 'Skill',
        component: StaffPractisingCertificate,
        path: '/company/staff/:id/practising-certificate',
        template: 'main',
        hide: true
    },
];