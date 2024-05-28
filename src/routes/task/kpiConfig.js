import React from "react";
import KpiConfig from "~/scenes/Company/Task/KpiConfig";
import KpiConfigForm from "~/scenes/Company/Task/KpiConfig/KpiConfigForm.js";
import Group from "~/scenes/Company/Task/KpiConfig/Group";

export default [
  {
    key: "company.kpiconfig",
    name: "KPI Config",
    component: KpiConfig,
    path: "/company/kpiconfig",
    template: "main",
    hide: true,
    // permission: 'company-staff-list',
    // requiredStaffIds: ['5900'] // thamnn
    permission: 'hr-kpi-config-list',
  },
  {
    key: "company.kpiconfig.create",
    name: "KPI Config Create",
    component: KpiConfigForm,
    path: "/company/kpiconfig/create",
    template: "main",
    hide: true,
    // permission: 'company-staff-list',
    // requiredStaffIds: ['5900'] // thamnn
    permission:'hr-kpi-config-create'
  },
  {
    key: "company.kpiconfig.edit",
    name: "KPI Config Edit",
    component: KpiConfigForm,
    path: "/company/kpiconfig/:id/edit",
    template: "main",
    hide: true,
    // permission: 'company-staff-list',
    // requiredStaffIds: ['5900'] // thamnn
    permission:'hr-kpi-config-update'
  },
  {
    key: "company.kpiconfig.group",
    name: "Group",
    component: Group,
    path: "/company/kpiconfig/group",
    template: "main",
    hide: true,
    // permission: 'company-staff-list',
    // requiredStaffIds: ['5900'] // thamnn
  },
];
