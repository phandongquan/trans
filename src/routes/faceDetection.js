import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCameraRetro } from '@fortawesome/free-solid-svg-icons'
import FaceDetection from '~/scenes/Customer/FaceDetection';

export default [
    {
        key: 'customer.face-detect',
        name: 'Face Detection',
        component: FaceDetection,
        path: '/customer/face-detect',
        template: 'main',
        hide: true,
        icon: <FontAwesomeIcon icon={faCameraRetro} />,
    },
];