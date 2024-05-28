import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
// import StaffNotificationDevice from "~/scenes/Company/StaffNotificationDevice";
import StaffNotificationDevice from "~/scenes/Company/StaffNotificationDevice";
import StaffNotification from "~/scenes/Company/StaffNotificationDevice/StaffNotification";
const parentNotificationDevice = [
  {
    key: "company.staff-notification-device",
    name: "Staff Notification Device",
    component: StaffNotificationDevice,
    path: "/company/staff-notification-device",
    template: "main",
    icon: <FontAwesomeIcon icon={faBell} />,
    // permission: "check_required",
    permission: "hr-setting-staff-device-list",
    // requiredManager: true,
    // exceptMajors: [64],
  },
  
];
const childNotificationDevice = [
  {
    key: "company.staff-notification",
    name: "Staff Notification",
    component: StaffNotification,
    path: "/company/staff-notification",
    template: "main",
    hide: true,
    permission: "hr-setting-staff-notification-list"
  },
]
export { parentNotificationDevice , childNotificationDevice}
