import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faBolt } from "@fortawesome/free-solid-svg-icons";
import ElectricityManagement from "~/scenes/ElectricityManagement";
import ElectricityManagementMonthly from "~/scenes/ElectricityManagement/ElectricityManagementMonthly";
import AccountConfig from "~/scenes/ElectricityManagement/ConfigLocations";
import ElectricityManagemanetInvoices from "~/scenes/ElectricityManagement/ElectricityManagemanetInvoices";
import PowerOutageSchedule from "~/scenes/ElectricityManagement/PowerOutageSchedule";
const route = [
  {
    key: "electricity-management",
    name: "Electricity Management",
    component: ElectricityManagement,
    path: "/electricity-management",
    permission: "hr-tool-electricity-management-list",
    icon: <FontAwesomeIcon icon={faBolt} />,
    template: "main",
  },
 
];
const child = [
  {
    key: "electricity-management-daily",
    name: "Report Electric Daily",
    component: ElectricityManagementMonthly,
    path: "/electricity-management/monthly",
    permission: "hr-tool-electricity-management-list",
    template: "main",
    hide: true
  },
  {
    key: "electricity-management-daily",
    name: "Report Electric Daily",
    component: AccountConfig,
    path: "/electricity-management/config",
    permission: "hr-tool-electricity-management-list",
    template: "main",
    hide: true
  },
  {
    key: "electricity-management-daily",
    name: "Report Electric Daily",
    component: ElectricityManagemanetInvoices,
    path: "/electricity-management/invoices",
    permission: "hr-tool-electricity-management-list",
    template: "main",
    hide: true
  },
  {
    key: "social.poweroutage.schedule",
    name: "Power Outage Schedule",
    component: PowerOutageSchedule,
    path: "/social/power-outage-schedule",
    template: "main",
    hide: true
    // permission: "hr-tool-room-meeting-list",
  },
];
export { route, child}

