import React from "react";
import TrainingPlan from "~/scenes/Company/TrainingPlan";
import TrainingPlanForm from "~/scenes/Company/TrainingPlan/TrainingPlanForm";
import TrainingPlanStaff  from "~/scenes/Company/TrainingPlan/TrainingPlanStaff";
import TrainingPlanPreview from "~/scenes/Company/TrainingPlan/TrainingPlanPreview";
export default [
  {
    key: "company.training-plan.create",
    name: "Training Plan Create",
    component: TrainingPlanForm,
    path: "/company/training-plan/create",
    template: "main",
    hide: true,
  },
  {
    key: "company.training-plan.edit",
    name: "Training Plan ",
    component: TrainingPlanForm,
    path: "/company/training-plan/:id/edit",
    template: "main",
    hide: true,
  },
  {
    key: 'company.staff.training-plan',
        name: 'Training Plan Staff',
        component: TrainingPlanStaff,
        path: '/company/staff/:id/training-plan',
        template: 'main',
        hide: true
},
{
  key: "company.training-plan.preview",
  name: "Training Plan Preview",
  component: TrainingPlanPreview,
  path: "/company/training-plan/:id/preview",
  template: "main",
  hide: true,
  permission: "hr-training-examination-preview",
},

];
