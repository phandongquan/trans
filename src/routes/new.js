import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faNewspaper } from '@fortawesome/free-solid-svg-icons';
import New from '~/scenes/Company/New';
import NewForm from '~/scenes/Company/New/NewForm';
import NewCategories from '~/scenes/Company/New/Category';

import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import JobQuestion from '~/scenes/Company/JobQuestion';
import JobQuestionForm from '~/scenes/Company/JobQuestion/JobQuestionForm';

export default [
    {
        key: 'company.news',
        name: 'News',
        component: New,
        path: '/company/news',
        template: 'main',
        icon: <FontAwesomeIcon icon={faNewspaper} />,
        hide: true,
        permission: 'hr-job-new-list'
    },
    {
        key: 'company.news.create',
        name: 'New Create',
        component: NewForm,
        path: '/company/news/create',
        template: 'main',
        hide: true,
        permission: 'hr-job-new-create'
    },
    {
        key: 'company.news.edit',
        name: 'New Edit',
        component: NewForm,
        path: '/company/news/:id/edit',
        template: 'main',
        hide: true,
        permission: 'hr-job-new-update'
    },
    {
        key: 'company.news.categories',
        name: 'New Categories',
        component: NewCategories,
        path: '/company/news/categories',
        template: 'main',
        hide: true,
        permission: 'hr-job-new-categories-list'
    },
    {
        key: 'company.news.questions',
        name: 'New Questions',
        component: JobQuestion,
        path: '/company/news/questions',
        template: 'main',
        icon: <FontAwesomeIcon icon={faQuestionCircle} />,
        hide: true,
        permission: 'hr-job-new-categories-list'
    },
    {
        key: 'company.news.questions.create',
        name: 'New Questions Create',
        component: JobQuestionForm,
        path: '/company/news/questions/create',
        template: 'main',
        hide: true,
        permission: 'hr-job-new-categories-list'
    },
    {
        key: 'company.news.questions.edit',
        name: 'New Questions Edit',
        component: JobQuestionForm,
        path: '/company/news/questions/:id/edit',
        template: 'main',
        hide: true,
        permission: 'hr-job-new-categories-list'
    }
];