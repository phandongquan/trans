import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import Language from "~/scenes/Language";
import languageV2 from "~/scenes/Language/index_v2";
export default [
  {
    key: "setting.language",
    name: "Language",
    component: languageV2,
    path: "/setting/language",
    permission: "hr-setting-language-list",
    icon: <FontAwesomeIcon icon={faGlobe} />,
    template: "main",
  },
];