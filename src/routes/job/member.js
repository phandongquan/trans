import Members from '~/scenes/Company/Job/Members';
import MemberDetail from '~/scenes/Company/Job/Members/MemberDetail';
import MemberForm from '~/scenes/Company/Job/Members/MemberForm';

export default [
    {
        key: 'company.job.members',
        name: 'Members',
        component: Members,
        path: '/company/job/members',
        template: 'main',
        hide: true,
        permission: 'hr-job-member-list'
    },
    {
        key: 'company.job.members.detail',
        name: 'Member Detail',
        component: MemberDetail,
        path: '/company/job/members/:id/detail',
        permission: 'hr-job-member-list',
        template: 'main',
        hide: true
    },
    {
        key: 'company.job.members.detail',
        name: 'Member Detail',
        component: MemberDetail,
        path: '/company/job/members/:id/detail/:job_apply_id',
        permission: 'hr-job-member-list',
        template: 'main',
        hide: true
    },
    {
        key: 'company.job.members.create',
        name: 'Member Create',
        component: MemberForm,
        path: '/company/job/members/create',
        permission: 'hr-job-member-list',
        template: 'main',
        hide: true
    },
    {
        key: 'company.jobs.members.edit',
        name: 'Member Edit',
        component: MemberForm,
        path: '/company/job/members/:id/edit',
        permission: 'hr-job-member-list',
        template: 'main',
        hide: true
    },
];