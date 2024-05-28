import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark } from '@fortawesome/free-solid-svg-icons'

import member from './job/member';
import candidate from './job/candidate';

import Job from '~/scenes/Company/Job';
import JobForm from '~/scenes/Company/Job/JobForm';
import JobApply from '~/scenes/Company/Job/JobApply';
import Members from '~/scenes/Company/Job/Members';
import Candidate from '~/scenes/Company/Job/Candidate';
import Specific from '~/scenes/Company/Job/Specific';
import SpecificCreate from '~/scenes/Company/Job/Specific/SpectificDetail';

import New from '~/scenes/Company/New';

import { checkPermission } from '~/services/helper';
import EvaluationCriteria from '~/scenes/Company/Job/EvaluationCriteria';
import JobDetailCriteria from '~/scenes/Company/Job/EvaluationCriteria/JobDetailCriteria';

export default [
    {
        key: 'company.job',
        name: 'Job',
        component: Job,
        path: '/company/job',
        template: 'main',
        icon: <span className='icon_menu icon_job'></span>,
        permissionOfChild: ['hr-job-list', 'hr-job-candidate-list' , 'hr-job-member-list', 'hr-job-new-list'],
        // permission: 'company-staff-list'
        children: [
            {
                key: 'company.job.list',
                name: 'Job',
                component: Job,
                path: '/company/job',
                template: 'main',
                permission:'hr-job-list'
            },
            {
                key: 'company.job.candidates',
                name: 'Candidates',
                component: Candidate,
                path: '/company/job/candidates',
                template: 'main',
                // hide: true,
                permission: 'hr-job-candidate-list'
            },
            {
                key: 'company.job.members',
                name: 'Members',
                component: Members,
                path: '/company/job/members',
                template: 'main',
                // hide: true,
                permission: 'hr-job-member-list'
            },
            {
                key: 'company.news',
                name: 'News',
                component: New,
                path: '/company/news',
                template: 'main',
                // hide: true,
                permission: 'hr-job-new-list'
            },
            {
                key: 'company.job.evaluation-criteria',
                name: 'Evaluation Criteria',
                component: EvaluationCriteria,
                path: '/company/job/evaluation-criteria',
                template: 'main',
                // hide: true,
                // permission: 'hr-job-update'
                permission:'hr-job-evaluation-criteria-list'
            },
            {
                key: 'company.job.specific',
                name: 'Specific Questions',
                component: Specific,
                path: '/company/job/specific',
                template: 'main',
                // hide: true,
                permission: 'hr-job-specific-questions-list'
            }
        ]
    },
    {
        key: 'company.job.create',
        name: 'Job Create',
        component: JobForm,
        path: '/company/job/create',
        template: 'main',
        hide: true,
        permission: 'hr-job-create'
    },
    {
        key: 'company.job.edit',
        name: 'Job Edit',
        component: JobForm,
        path: '/company/job/:id/edit',
        template: 'main',
        hide: true,
        permission: 'hr-job-update'
    },
    {
        key: 'company.job.apply',
        name: 'Job Edit',
        component: JobApply,
        path: '/company/job/:id/apply',
        template: 'main',
        hide: true,
        permission: 'hr-job-update'
    },
    
    {
        key: 'company.job.detail-job.evaluation-criteria',
        name: 'Job Detail Evaluation Criteria',
        component: JobDetailCriteria,
        path: '/company/job/:id/evaluation-criteria',
        template: 'main',
        hide: true,
        // permission: 'hr-job-update'
        permission: 'hr-job-detail-evalution-criteria-list'
    },
    {
        key: 'company.job.specific',
        name: 'Job Specific',
        component: Specific,
        path: '/company/job/specific',
        template: 'main',
        hide: true,
        // permission: 'hr-job-update'
    },
    {
        key: 'company.job.specific.create',
        name: 'Job Specific Create',
        component: SpecificCreate,
        path: '/company/job/specific/create',
        template: 'main',
        hide: true,
    },
    {
        key: 'company.job.specific.edit',
        name: 'Job Specific Edit',
        component: SpecificCreate,
        path: '/company/job/specific/:id/edit',
        template: 'main',
        hide: true,
    },
    ...member,
    ...candidate
];