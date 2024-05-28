import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAudio, faPhone } from "@fortawesome/free-solid-svg-icons";
import AudioCall from "~/scenes/AudioCall/AudioCall";
import AudioCallV2 from "~/scenes/AudioCall/AudioCallV2";
import RecordAudioCall from "~/scenes/AudioCall/Record";

const parentAudioCall = [
  {
    key: "audio-call",
    name: "Audio Call",
    component: AudioCall,
    path: "/audio-call",
    template: "main",
    icon: <FontAwesomeIcon icon={faPhone} />,
    // permission: "check_required",
    // permission: "hr-tool-audio-spa-list",
    // requiredManagerHigher: true,
    // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức
    // exceptMajors: [64, 21],
    permisssion: 'hr-tool-audio-call-list'
  },
 
];
const childAudioCall = [
  {
    key: "audio-call-v2",
    name: "Audio Call V2",
    component: AudioCallV2,
    path: "/audio-call-v2",
    template: "main",
    hide: true,
    requiredManagerHigher: true,
    requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức
    exceptMajors: [64, 21],
  },
  {
    key: "record-audio",
    name: "Record Audio",
    component: RecordAudioCall,
    path: "/record-audio",
    template: "main",
    hide: true,
    // requiredManagerHigher: true,
    // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức
    // exceptMajors: [64, 21],
  },
]
export { parentAudioCall, childAudioCall };