import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAudio } from "@fortawesome/free-solid-svg-icons";
import AudioSpa from "~/scenes/AudioSpa";

export default [
  {
    key: "audio-spa",
    name: "Audio Spa",
    component: AudioSpa,
    path: "/audio-spa",
    template: "main",
    icon: <FontAwesomeIcon icon={faFileAudio} />,
    // permission: "check_required",
    permission: "hr-tool-audio-spa-list",
    // requiredManagerHigher: true,
    // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức
    // exceptMajors: [64, 21],
  },
];
