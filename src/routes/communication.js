import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComments } from '@fortawesome/free-solid-svg-icons'
import Communication from '~/scenes/Company/CommunicationV1';
import CommunicationForm from '~/scenes/Company/CommunicationV1/CommunicationForm';
import Categories from '~/scenes/Company/CommunicationV1/Category';
import CommunicationViewConfirm from '~/scenes/Company/CommunicationV1/CommunicationViewConfirm';

export default [
    {
        key: 'company.communication',
        name: 'Communication (old)',
        component: Communication,
        path: '/company/communication',
        template: 'main',
        icon: <span className='icon_menu icon_communication'></span>,
        // permission: 'company-communication',
        permissionOfChild: ['hr-communication-list', 'hr-communication-categories-list'],
        children: [
            {
                key: 'company.communication',
                name: 'Communication',
                component: Communication,
                path: '/company/communication',
                template: 'main',
                // permission: 'company-communication',
                permission: 'hr-communication-list',
            },
            {
                key: 'company.communication.categories',
                name: 'Categories',
                component: Categories,
                path: '/company/communication/categories',
                template: 'main',
                // hide: true,
                permission: 'hr-communication-categories-list'
            },

        ]
    },
    {
        key: 'company.communication.create',
        name: 'Communication Create',
        component: CommunicationForm,
        path: '/company/communication/create',
        template: 'main',
        hide: true,
        permission: 'hr-communication-create'
    },
    {
        key: 'company.communication.edit',
        name: 'Communication Edit',
        component: CommunicationForm,
        path: '/company/communication/:id/edit',
        template: 'main',
        hide: true,
        permission: 'hr-communication-list'
    },
    {
        key: 'company.communication.view.confirm',
        name: 'Communication View Confirm',
        component: CommunicationViewConfirm,
        path: '/company/communication/:id/view-confirm',
        template: 'main',
        hide: true
    },
];