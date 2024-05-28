import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestion } from '@fortawesome/free-solid-svg-icons'
import TrainningQuestionForm from '~/scenes/Company/TrainningQuestion/TrainningQuestionForm';

import TrainningQuestion from '~/scenes/Company/TrainningQuestion';
import TrainingQuestionFeedbacks from '~/scenes/Company/TrainningQuestion/TrainingQuestionFeedbacks';

export default [
    {
        key: 'company.trainning-question',
        name: 'Trainning Question',
        component: TrainningQuestion,
        path: '/company/trainning-question',
        template: 'main',
        hide: true,
        // permission: 'company-training-question'
        permission: 'hr-trainning-question-list'
    },

    {
        key: 'company.trainning-question.edit',
        name: 'Trainning Question',
        component: TrainningQuestionForm,
        path: '/company/trainning-question/:id/edit',
        template: 'main',
        hide: true,
        permission: 'hr-trainning-question-list'
    },
    {
        key: 'company.trainning-question.create',
        name: 'Trainning Question',
        component: TrainningQuestionForm,
        path: '/company/trainning-question/create',
        template: 'main',
        hide: true,
        permission: 'hr-trainning-question-create'

    },
    {
        key: 'company.training-question.feedbacks',
        name: 'Training Question Feedbacks',
        component: TrainingQuestionFeedbacks,
        path: '/company/training-question/feedbacks',
        template: 'main',
        hide: true
    }
];