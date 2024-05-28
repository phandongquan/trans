import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWifi } from "@fortawesome/free-solid-svg-icons";
import TrackingWifi from "~/scenes/TrackingWifi";
export default [
    {
        key: "tracking-wifi",
        name: "Tracking Wifi",
        component: TrackingWifi,
        path: "/tracking-wifi",
        permission: 'hr-tool-tracking-wifi-list',
        template: "main",
        icon: <FontAwesomeIcon icon={faWifi} />,
    },
];
