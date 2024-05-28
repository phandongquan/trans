import React from "react";
import Staff_Devices from "./Staff_Devices";
import language from "./language";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import position from "./position";
import major from "./major";
import organigram from "./organigram";
import groupWorkplace from "./groupWorkplace";
import meeting from "./meeting";
import { parentNotificationDevice, childNotificationDevice } from "./staffDevice";



export default [
    {
        key: 'company.setting',
        name: 'Setting',
        path: '/setting',
        template: 'main',
        icon: <FontAwesomeIcon icon={faCog} />,
        permissionOfChild: [
            'hr-setting-language-list',
            'hr-setting-staff-device-list',
            'hr-setting-position-list',
            'hr-setting-major-list',
            'hr-setting-staff-device-list',
            'hr-setting-staff-notification-list',
            'hr-setting-workplace-approve'
        ],
        children: [
            ...Staff_Devices,
            ...language,
            ...position,
            ...major,
            ...organigram,
            ...groupWorkplace,
            ...parentNotificationDevice,
            ...meeting,

        ],
    },
    ...childNotificationDevice,
]