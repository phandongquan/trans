import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import AiCheckLight from "~/scenes/AiCheckLight";
import EditCamera from "~/scenes/AiCheckLight/EditCamera";
import GroupCameraShop from "~/scenes/AiCheckLight/GroupCameraShop";

const parentCameraShop = [
  {
    key: "camera-shop",
    name: "Camera Shop",
    component: AiCheckLight,
    path: "/camera-shop",
    template: "main",
    icon: <FontAwesomeIcon icon={faVideo} />,
    // permission: "check_required",
    permission: "hr-tool-camera-shop-list",
    // requiredManagerHigher: true,
    // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức,
    // exceptMajors: [64, 21],
  },
]
const childCameraShop = [
  {
    key: "edit-camera-shop",
    name: "Edit Camera Shop",
    component: EditCamera,
    path: "/edit-camera-shop",
    template: "main",
    hide: true,
    // permission: "check_required",
    // requiredManagerHigher: true,
    // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức
    // exceptMajors: [64, 21],
    permission: "hr-tool-camera-shop-list"

  },
  {
    key: "group-camera-shop",
    name: "Group Camera Shop",
    component: GroupCameraShop,
    path: "/group-camera-shop",
    template: "main",
    hide: true,
    // permission: "check_required",
    permission: "hr-tool-group-camera-shop-list",
    // requiredManagerHigher: true,
    // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức
    // exceptMajors: [64, 21],
  },
];
export { parentCameraShop, childCameraShop };
