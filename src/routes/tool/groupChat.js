import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import GroupsChat from "~/scenes/GroupsChat";

export default [
  {
    key: "social.chat",
    name: "Chat",
    template: "main",
    path: "/social/chat",
    component: GroupsChat,
    icon: <FontAwesomeIcon icon={faUsers} />,
    permission: "hr-tool-chat-list"
  },
];
