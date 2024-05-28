import Candidate from '~/scenes/Company/Job/Candidate';

export default [
    {
        key: 'company.job.candidate',
        name: 'Candidates',
        component: Candidate,
        path: '/company/job/candidates',
        template: 'main',
        hide: true,
        permission: 'hr-job-candidate-list'
    }
]