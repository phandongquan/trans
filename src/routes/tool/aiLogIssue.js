import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImages,
  faChild
} from "@fortawesome/free-solid-svg-icons";
import AILogIssue from "~/scenes/AILogIssue";
import logIssueForm from "~/scenes/AILogIssue/logIssueForm";
import AiLogCustomer from "~/scenes/AiLogCustomer";

const parentAILogIssue = [
    {
        key: "ai-logissue",
        name: "AI Log Issue",
        component: AILogIssue,
        path: "/ai-logissue",
        template: "main",
        icon: <FontAwesomeIcon icon={faImages} />,
        // permission: "check_required",
        permission: "hr-tool-ai-log-issue-list",
        // requiredManagerHigher: true,
        // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức
      },
      {
        key: "ai-log-customer",
        name: "AI Log Customer",
        component: AiLogCustomer,
        path: "/ai-log-customer",
        template: "main",
        icon: <FontAwesomeIcon icon={faChild} />,
        // permission: "check_required",
        permission: "hr-tool-ai-log-customer-list",
        // requiredManagerHigher: true,
        // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức
        // exceptMajors: [64, 21],
      },
     
]
const childAILogIssue = [
  {
    key: "ai-logissue.create",
    name: "Ai LogIssue Create",
    component: logIssueForm,
    path: "/ai-log-issue/create",
    template: "main",
    hide: true,
    // permission: "check_required",
    permission: "hr-tool-ai-log-issue-update",
    // requiredManagerHigher: true,
    // requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức
  },
  {
    key: "ai-logissue.edit",
    name: "Ai LogIssue Edit",
    component: logIssueForm,
    path: "/ai-log-issue/:id/edit",
    template: "main",
    hide: true,
    permission: "check_required",
    requiredManagerHigher: true,
    requiredStaffIds: [5902, 8598, 5082], // Thiện Hảo, Văn Phúc, Trọng Đức
  },

  // Ai log customer
 
]
export { parentAILogIssue, childAILogIssue };