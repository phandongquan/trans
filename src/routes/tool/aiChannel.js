import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhotoVideo } from "@fortawesome/free-solid-svg-icons";
import ShowImageChannel from "~/scenes/imageChannel/index";

export default [
  {
    key: "image-channel",
    name: "Image Channel",
    component: ShowImageChannel,
    path: "/image-channel",
    template: "main",
    icon: <FontAwesomeIcon icon={faPhotoVideo} />,
    // permission: "check_required",
    permission: "hr-tool-image-channel-list",
    // requiredManagerHigher: true,
    // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức
  },
];
