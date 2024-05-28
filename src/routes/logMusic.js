import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic } from "@fortawesome/free-solid-svg-icons";
import Music from "~/scenes/Music";
import LogPlayMusic from "~/scenes/Music/LogPlayMusic";
import Advertisement from "~/scenes/Music/Advertisement";
import AdvertisementVideo from "~/scenes/Music/AdvertisemenVideo";

export default [
  {
    key: "Log-Music",
    name: "Log Music",
    component: LogPlayMusic,
    path: "/log-play-music",
    template: "main",
    icon: <FontAwesomeIcon icon={faMusic} />,
    // permission: "check_required",
    permissionOfChild: ["hr-log-play-music-list", "hr-log-music-list", "hr-log-music-advertisement-list"],
    // requiredManager: true,
    // requiredMajors: [38, 13], // Marketing, Content Excutive,
    // requiredStaffIds: [5902], // Thiện Hảo, Văn Phúc, Trọng Đức,
    children:[
      {
        key: "log-play-music",
        name: "Log Music",
        component: LogPlayMusic,
        path: "/log-play-music",
        template: "main",
        // permission: "check_required",
        permission: "hr-log-play-music-list",
        // requiredManager: true,
        // requiredMajors: [38, 13], // Marketing, Content Excutive,
        // requiredStaffIds: [5902], // Thiện Hảo, Văn Phúc, Trọng Đức,
      },
      {
        key: "music",
        name: "Music",
        template: "main",
        path: "/music",
        component: Music,
        // hide: true,
        // permission: "check_required",
        permission: "hr-log-music-list",
        // requiredManager: true,
        // requiredMajors: [38, 13], // Marketing, Content Excutive
        // requiredStaffIds: [5902], // Thiện Hảo, Văn Phúc, Trọng Đức,
      },
      {
        key: "video",
        name: "Video",
        template: "main",
        path: "/video",
        component: AdvertisementVideo,
        permission: "hr-log-video-list",
      },
      {
        key: "advertisment",
        name: "Advertisment",
        component: Advertisement,
        path: "/advertisment",
        template: "main",
        // hide: true,
        // permission: "check_required",
        permission: "hr-log-music-advertisement-list",
        // requiredManager: true,
        // requiredMajors: [38, 13], // Marketing, Content Excutive
        // requiredStaffIds: [5902], // Thiện Hảo, Văn Phúc, Trọng Đức,
      },
    ]
  }, 
];
