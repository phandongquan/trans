import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAudio } from "@fortawesome/free-solid-svg-icons";
import TranslateAudio from "~/scenes/TranslateAudio";

export default [
  {
    key: "translate-audio",
    name: "Translate Audio",
    component: TranslateAudio,
    path: "/translate-audio",
    permission: "hr-tool-translate-audio-list",
    icon: <FontAwesomeIcon icon={faFileAudio} />,
    template: "main",
  },
];
