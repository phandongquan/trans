import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStream } from '@fortawesome/free-solid-svg-icons'

import TrainingExamination from '~/scenes/Company/TrainingExamination';
import TrainingExaminationForm from '~/scenes/Company/TrainingExamination/TrainingExaminationForm';
import TrainingExaminationHistory from '~/scenes/Company/TrainingExamination/TrainingExaminationHistory';
import TrainingExaminationPreview from '~/scenes/Company/TrainingExamination/TrainingExaminationPreview';
import ExaminationResult from '~/scenes/Company/TrainingExamination/ExaminationResult';
import TrainningQuestion from '~/scenes/Company/TrainningQuestion';
import TrainingQuestionFeedbacks from '~/scenes/Company/TrainningQuestion/TrainingQuestionFeedbacks';

import ListTrainingExamination from '~/scenes/Company/TrainingExamination/ListTrainingExamination';
import { majorAreaManager, majorStoreManager } from '~/constants/basic';

// TrainingPlan components
import TrainingPlan from "~/scenes/Company/TrainingPlan";
import TrainingPlanReport from '~/scenes/Company/TrainingPlan/TrainingReport';

export default [
  {
    key: "company.training-examination",
    name: "Training",
    component: TrainingExamination,
    path: "/company/training-examination",
    icon: <span className="icon_menu icon_trainning"></span>,
    template: "main",
    // requiredMajors: [majorStoreManager, majorAreaManager],
    // permission: 'company-training-exam'
    permissionOfChild: [
      "hr-training-examination-list",
      "hr-examination-result-list",
      "hr-trainning-question-list",
      "hr-training-question-feedbacks-list",
    ],
    children: [
      {
        key: "company.training-examination",
        name: "Training",
        component: TrainingExamination,
        path: "/company/training-examination",
        template: "main",
        permission: "hr-training-examination-list",
      },
      {
        key: "company.training-examination.result",
        name: "Training Examination Result",
        component: ExaminationResult,
        path: "/company/training-examination/result",
        template: "main",
        // hide: true,
        permission: "hr-examination-result-list",
      },
      {
        key: "company.trainning-question",
        name: "Trainning Question",
        component: TrainningQuestion,
        path: "/company/trainning-question",
        template: "main",
        // hide: true,
        // permission: 'company-training-question'
        permission: "hr-trainning-question-list",
      },
      {
        key: "company.training-question.feedbacks",
        name: "Training Question Feedbacks",
        component: TrainingQuestionFeedbacks,
        path: "/company/training-question/feedbacks",
        template: "main",
        // hide: true
        permission: "hr-trainning-feedback-list",
      },
      {
        key: "company.training-plan",
        name: "Training Plan",
        component: TrainingPlan,
        path: "/company/training-plan",
        template: "main",
        permission: 'hr-training-plan-list'
      },
      {
        key: "company.training-report",
        name: "Training Report",
        component: TrainingPlanReport,
        path: "/company/training-report",
        template: "main",
        permission: 'hr-training-report-list'
      },
      
    ],
  },
  {
    key: "company.training-examination.edit",
    name: "Training Examination Edit",
    component: TrainingExaminationForm,
    path: "/company/training-examination/:id/edit",
    template: "main",
    hide: true,
  },
  {
    key: "company.training-examination.create",
    name: "Training Examination Create",
    component: TrainingExaminationForm,
    path: "/company/training-examination/create",
    template: "main",
    hide: true,
  },
  {
    key: "company.training-examination.preview",
    name: "Training Examination Preview",
    component: TrainingExaminationPreview,
    path: "/company/training-examination/:id/preview",
    template: "main",
    hide: true,
    permission: "hr-training-examination-preview",
  },
  {
    key: "company.training-examination.history",
    name: "Training Examination History",
    component: TrainingExaminationHistory,
    path: "/company/training-examination/:id/history",
    template: "main",
    hide: true,
  },
  {
    key: "company.training-examination.list-exam",
    name: "Training Examination List Exam",
    component: ListTrainingExamination,
    path: "/company/training-examination/list-exam",
    template: "main",
    hide: true,
  },
];