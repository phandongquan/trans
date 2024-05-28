import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import GroupApproved from "~/scenes/Workplace/Group/Approved";

export default [
  {
    key: "social.workplace",
    name: "Workplace",
    component: GroupApproved,
    path: "/social/workplace",
    template: "main",
    icon: <FontAwesomeIcon icon={faCheckCircle} />,
    requiredManager: true,
    // permission: "check_required",
    permission: "hr-tool-workplace-list",
    // requiredManagerHigher: true,
    // requiredDepts: [133], // Departments [R&D]
  },
];
