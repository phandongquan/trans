import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDay } from "@fortawesome/free-solid-svg-icons";
import Major from "~/scenes/Major";

export default [
  {
    key: "setting.major",
    name: "Major",
    component: Major,
    path: "/setting/major",
    permission: "hr-setting-major-list",
    icon: <FontAwesomeIcon icon={faCalendarDay} />,
    template: "main",
  },
];
