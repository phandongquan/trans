import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import DiagramStore from '~/scenes/DiagramStore';
export default [
    {
        key: 'diagram-store',
        name: 'Diagram Store',
        component: DiagramStore,
        path: '/diagram-store',
        template: 'main',
        hide: true,
        permission: 'hr-daily-task-diagram-store-list'
    }
]