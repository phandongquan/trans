import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPeopleArrows, faSlash } from "@fortawesome/free-solid-svg-icons";
import PowerOutageSchedule from "~/scenes/ElectricityManagement/PowerOutageSchedule";
import { faCalendarMinus } from "@fortawesome/free-regular-svg-icons";

export default [
  {
    key: "social.poweroutage.schedule",
    name: "Power Outage Schedule",
    component: PowerOutageSchedule,
    path: "/social/power-outage-schedule",
    icon: <FontAwesomeIcon icon={faCalendarMinus} />,
    template: "main",
    // permission: "hr-tool-room-meeting-list",
  },
];
