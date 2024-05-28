import React from "react";
import { Redirect } from "react-router-dom";
import aiDetect from "./aiDetect";
import { parentCameraShop, childCameraShop } from "./cameraShop";
import { parentFaceRegconite, childFaceRegconite } from "./faceRecognition";
import { parentAILogIssue, childAILogIssue } from "./aiLogIssue";
import aiChannel from "./aiChannel";
import audioSpa from "./audioSpa";
import groupChat from "./groupChat";
import wifiMarketing from "./wifiMarketing";
import { parentAudioCall, childAudioCall } from "./audioCall";
import { route as electricityManagementParent, child as electricityManagementChild } from "./electricityManagement";
import { route as waterManagement, child as childWaterManagement } from "./waterManagement";
import trackingWifi from "./trackingWifi";
import AiCheckLight from "~/scenes/AiCheckLight";
import ElectricityManagement from "~/scenes/ElectricityManagement";
import FaceDetection from "~/scenes/Customer/FaceDetection";
import FaceRegconite from "~/scenes/FaceRegconite";
import AILogIssue from "~/scenes/AILogIssue";
import AudioCall from "~/scenes/AudioCall/AudioCall";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo, faUserCircle, faBolt, faCameraRetro, faImages, faBell, faPhone } from "@fortawesome/free-solid-svg-icons";
import { route as chatBot } from "./chatBot";
import { route as AnalysisImageRoute } from "./analysisImage";
import translateAudio from "./translateAudio"
export default [
  {
    key: "tools",
    name: "Tools",
    template: "main",
    path: "/tools",
    component: () => <Redirect exact to="/sales/404" />,
    icon: <span className="icon_menu icon_tool"></span>,
    // permission: "check_required",
    permissionOfChild: [
      'hr-tool-analysis-image-list',
      'hr-tool-translate-audio-list',
      'hr-tool-chat-bot-management-list',
      'hr-tool-tracking-wifi-list',
      'hr-tool-water-management-list',
      'hr-tool-electricity-management-list',
      "hr-tool-face-detection-list",
      "hr-tool-ai-detection-list",
      "hr-tool-camera-shop-list",
      "hr-tool-face-regconite-list",
      "hr-tool-ai-log-issue-list",
      "hr-tool-ai-log-customer-list",
      "hr-tool-image-channel-list",
      "hr-tool-audio-spa-list",
      "hr-tool-chat-list",
      "hr-tool-wifi-marketing-list",
    ],
    // requiredManagerHigher: true,
    // requiredStaffIds: [5902, 8598, 5082 , 10841 , 8856 , 9058 , 7959], // Thiện Hảo, Văn Phúc, Trọng Đức ,  , Nguyễn Công Định , Phạm Thị Sáng ,Trần Thị Ngọc Trinh, Trịnh Thị Thảo Nhi
    children: [
      // ...Staff_Devices,
      ...electricityManagementParent,
      ...waterManagement,
      //...aiDetect,
      ...parentCameraShop,
      ...parentFaceRegconite,
      ...parentAILogIssue,
      ...aiChannel,
      ...audioSpa,
      // ...routeMeeting,
      ...groupChat,
      ...wifiMarketing,
      ...trackingWifi,
      ...chatBot,
      ...AnalysisImageRoute,
      ...parentAudioCall,
      ...translateAudio,
      // ...language,
      // ...Position, 
      // ...Major
    ],
  },
  ...electricityManagementChild,
  ...childWaterManagement,
  ...childCameraShop,
  ...childFaceRegconite,
  ...childAILogIssue,
  ...childAudioCall,
//   ...childMeeting,
];
