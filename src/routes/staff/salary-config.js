import StaffSalaryConfig from '~/scenes/Company/Staff/StaffConfig';

export default [
    {
        key: 'company.staff.salary-config',
        name: 'config',
        component: StaffSalaryConfig,
        path: '/company/staff/:id/salary-config',
        template: 'main',
        hide: true
    },
];