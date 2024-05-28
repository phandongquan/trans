import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import JobQuestion from '~/scenes/Company/JobQuestion';
import JobQuestionForm from '~/scenes/Company/JobQuestion/JobQuestionForm';

export default [
    {
        key: 'company.job-question',
        name: 'Job Question',
        component: JobQuestion,
        path: '/company/job-question',
        template: 'main',
        icon: <FontAwesomeIcon icon={faQuestionCircle} />,
    },
    {
        key: 'company.job-question.create',
        name: 'Job Question Create',
        component: JobQuestionForm,
        path: '/company/job-question/create',
        template: 'main',
        hide: true
    },
    {
        key: 'company.job-question.edit',
        name: 'Job Question Edit',
        component: JobQuestionForm,
        path: '/company/job-question/:id/edit',
        template: 'main',
        hide: true
    }
];