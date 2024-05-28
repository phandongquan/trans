import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faCameraRetro } from "@fortawesome/free-solid-svg-icons";
import AiDetection from "~/scenes/AiDetection";
import FaceDetection from "~/scenes/Customer/FaceDetection";

export default [
    {
        key: "customer.face-detect",
        name: "Face Detection",
        component: FaceDetection,
        path: "/customer/face-detect",
        template: "main",
        icon: <FontAwesomeIcon icon={faCameraRetro} />,
        // permission: "check_required",
        permission: "hr-tool-face-detection-list",
        // requiredManagerHigher: true,
        // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức,
        // exceptMajors: [64, 21],
      },
      {
        key: "ai-detection",
        name: "AI Detection",
        component: AiDetection,
        path: "/ai-detection",
        template: "main",
        icon: <FontAwesomeIcon icon={faExpand} />,
        // permission: "check_required",
        permission: "hr-tool-ai-detection-list",
        // requiredManagerHigher: true,
        // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức,
        // exceptMajors: [64, 21],
      },
]