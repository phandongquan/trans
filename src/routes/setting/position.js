import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faOutdent } from "@fortawesome/free-solid-svg-icons";

import Position from "~/scenes/Position";
export default [
  {
    key: "setting.position",
    name: "Position",
    component: Position,
    path: "/setting/position",
    permission: "hr-setting-position-list",
    icon: <FontAwesomeIcon icon={faOutdent} />,
    template: "main",
  },
];
