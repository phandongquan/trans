import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPeopleArrows } from "@fortawesome/free-solid-svg-icons";
import RoomMeeting from "~/scenes/RoomMeeting";

export default [
  {
    key: "social.room.meeting",
    name: "Room Meeting",
    component: RoomMeeting,
    path: "/social/roommeeting",
    icon: <FontAwesomeIcon icon={faPeopleArrows} />,
    template: "main",
    permission: "hr-tool-room-meeting-list",
  },
];
