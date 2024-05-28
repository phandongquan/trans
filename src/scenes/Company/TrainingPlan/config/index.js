export const statusTrainingPlan = {
  0: "Pending",
  1: "Approved",
  2: "Inactive",
  3: "Verify",
};

export const statusPending = 0;
export const statusApproved = 1;
export const statusVerify = 3;
export const statusInactive = 2;

export const statusTrainingPlanSkill = {
  0 : 'Inactive',
  1 : 'Active'
}

export const statusTrainingPlanReport = {
  0 : 'Inactive',
  1 : 'Active'
}

export const subTypeRangeUsers = {
  0 : 'Chỉ đọc' ,
  1 : 'Thi lý thuyết và thực hành',
  2 : 'Thi lý thuyết',
  3 : 'Thi thực hành',
}

export const typeTrainingPlan = {
  0 : 'Default' ,
  1 : 'WM < 1m',
  2 : 'WM >= 2m',
  3 : 'WM >= 6m',
}

export default {
  statusTrainingPlan,
  subTypeRangeUsers,
  statusTrainingPlanSkill
};
