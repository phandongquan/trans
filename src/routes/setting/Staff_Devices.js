import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faMobile } from "@fortawesome/free-solid-svg-icons";
import Staff_Device from "~/scenes/Company/Staff_Devices";

export default [
  {
    key: "Staff-devices",
    name: "Staff Devices",
    component: Staff_Device,
    path: "/setting/staff-devices",
    permission: "hr-setting-staff-device-list",
    icon: <FontAwesomeIcon icon={faMobile} />,
    template: "main",
  },
];
