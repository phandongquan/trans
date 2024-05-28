import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandHoldingWater } from "@fortawesome/free-solid-svg-icons";
import WaterManagement from "~/scenes/waterManagement";
import WaterManagementMonthly from "~/scenes/waterManagement/WaterManagementMonthly";
import WaterManagementInvoices from "~/scenes/waterManagement/WaterManagementInvoices";
import AccountConfig from "~/scenes/waterManagement/AccountConfig";
const route = [
    {
        key: "water-management",
        name: "Water Management",
        component: WaterManagement,
        path: "/water-management",
        icon: <FontAwesomeIcon icon={faHandHoldingWater} />,
        permission: "hr-tool-water-management-list",
        template: "main",
    },
];
const child = [
    {
        key: "water-management-monthly",
        name: "Report Water Monthly",
        component: WaterManagementMonthly,
        path: "/water-management/monthly",
        permission: "hr-tool-water-management-list",
        template: "main",
        hide: true
    },
    {
        key: "water-management-config",
        name: "Config",
        component: AccountConfig,
        path: "/water-management/config",
        permission: "hr-tool-water-management-list",
        template: "main",
        hide: true
    },
    {
        key: "water-management-config",
        name: "Invoices",
        component: WaterManagementInvoices,
        path: "/water-management/invoices",
        permission: "hr-tool-water-management-list",
        template: "main",
        hide: true
    }
];

export { route, child };
