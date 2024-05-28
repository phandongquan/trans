import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faFileMedical } from "@fortawesome/free-solid-svg-icons";
import Organigram from "~/scenes/Organigram";

export default [
  {
    key: "setting.organigram",
    name: "Organizational Chart",
    component: Organigram,
    path: "/setting/organigram",
    permission:"hr-setting-organigram-list",
    icon: <FontAwesomeIcon icon={faFileMedical} />,
    template: "main",
  },
];
