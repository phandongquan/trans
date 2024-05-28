import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import FeedBacksStaff from "~/scenes/Company/Staff/FeedBacksStaff";
import ConfigFeedback from "~/scenes/Company/Staff/config/configFeedback";

export default [
  {
    key: "social.feedbacks",
    name: "Feedback",
    component: FeedBacksStaff,
    path: "/social/feedbacks",
    icon: <FontAwesomeIcon icon={faEnvelope} />,
    template: "main",
    // permission: "check_required",
    permissionOfChild: ["hr-feedback-list", "hr-feedback-config-list"],
    // requiredManager: true,
    // requiredDivisions: [115], // HR
    // requiredStaffIds: [10197, 10249], // Ngọc Diệp, Kim Ngân
    children:[
      {
        key: "social.feedbacks",
        name: "Feedback",
        component: FeedBacksStaff,
        path: "/social/feedbacks",
        template: "main",
        // permission: "check_required",
        permission: "hr-feedback-list",
        // requiredManager: true,
        // requiredDivisions: [115], // HR
        // requiredStaffIds: [10197, 10249], // Ngọc Diệp, Kim Ngân
      },
      {
        key: "social.feedbacks.config",
        name: "Config",
        component: ConfigFeedback,
        path: "/social/feedbacks/config",
        template: "main",
        // hide: true,
        // permission: "check_required",
        permission: "hr-feedback-config-list",
        // requiredManager: true,
        // requiredDivisions: [115], // HR
        // requiredStaffIds: [10197, 10249], // Ngọc Diệp, Kim Ngân
      },
    ]
  },
];
