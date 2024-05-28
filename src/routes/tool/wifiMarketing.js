import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWifi } from "@fortawesome/free-solid-svg-icons";
import WifiMarketing from "~/scenes/WifiMarketing";

export default [
  {
    key: "wifi-marketing",
    name: "Wifi Marketing",
    component: WifiMarketing,
    path: "/wifi-marketing",
    template: "main",
    icon: <FontAwesomeIcon icon={faWifi} />,
    // permission: "check_required",
    permission: "hr-tool-wifi-marketing-list",
    // requiredManagerHigher: true,
    // requiredDepts: [112], // Deparments [Marketing]
    // requiredStaffIds: [5902 , 10841 , 8856 , 9058 , 7959  ], // Thiện Hảo , Nguyễn Công Định , Phạm Thị Sáng ,Trần Thị Ngọc Trinh, Trịnh Thị Thảo Nhi
    // exceptMajors: [64, 21],
  },
];
