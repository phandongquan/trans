import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import ChatBotManagement from "~/scenes/ChatBotManagement";

const route = [
    {
        key: "chat-bot-management",
        name: "Chat Bot Management",
        component: ChatBotManagement,
        path: "/tools/chat-bot-management",
        permission: "hr-tool-chat-bot-management-list",
        icon: <FontAwesomeIcon icon={faRobot} />,
        template: "main",
    },
];

export { route }

