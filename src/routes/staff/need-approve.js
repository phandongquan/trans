import StaffNeedApprove from '~/scenes/Company/Staff/StaffNeedApprove';
import StaffNeedApproveForm from '~/scenes/Company/Staff/StaffNeedApproveForm';

export default [
    {
        key: 'company.staff.need.approve',
        name: 'Staff Need Approve',
        component: StaffNeedApprove,
        path: '/company/staff/need-approve',
        template: 'main',
        hide: true
    },
    {
        key: 'company.staff.need.approve.edit',
        name: 'Staff Need Approve Edit',
        component: StaffNeedApproveForm,
        path: '/company/staff/:id/need-approve',
        template: 'main',
        hide: true
    },
];