import React from 'react';
import Document from '~/scenes/Company/Document';
import DocumentForm from '~/scenes/Company/Document/DocumentForm';
import DocumentCategory from '~/scenes/Company/Document/Category';
import DocumentType from '~/scenes/Company/Document/Type';
import DocumentFeedback from '~/scenes/Company/Document/Feedback';
import DocumentReport from '~/scenes/Company/Document/Report';
import DocumentMasterList from '~/scenes/Company/Document/MasterList';
import DocumentRead from '~/scenes/Company/Document/DocumentRead';
import Document_Form from '~/scenes/Company/Document/Document_Form';
import Communication from '~/scenes/Company/Communication';
import CommunicationViewConfirm from '~/scenes/Company/Communication/CommunicationViewConfirm';

export default [
    {
        key: 'company.document',
        name: 'Document',
        component: Document,
        path: '/company/document',
        template: 'main',
        icon: <span className='icon_menu icon_document'></span>,
        // permission: 'company-document-list'
        permissionOfChild: ['hr-document-list', 'hr-document-master-list', 'hr-document-categories-list', 'hr-document-type-list', 'hr-document-report-list', 'hr-document-feedback-list', 'hr-document-read-list'],
        children: [
            {
                key: 'company.document',
                name: 'Document',
                component: Document,
                path: '/company/document',
                template: 'main',
                // permission: 'company-document-list'
                permission: 'hr-document-list',
            },
            {
                key: 'company.document.master-list',
                name: 'Master List',
                component: DocumentMasterList,
                path: '/company/document/master-list',
                template: 'main',
                // hide: true,
                permission: 'hr-document-master-list'
            },
            {
                key: 'company.document.categories',
                name: 'Category',
                component: DocumentCategory,
                path: '/company/document/categories',
                template: 'main',
                // hide: true,
                permission: 'hr-document-categories-list'
            },
            {
                key: 'company.document.types',
                name: 'Types',
                component: DocumentType,
                path: '/company/document/types',
                template: 'main',
                // hide: true,
                permission: 'hr-document-type-list'
            },
            {
                key: 'company.document.report',
                name: 'Report',
                component: DocumentReport,
                path: '/company/document/report',
                template: 'main',
                // hide: true,
                permission: 'hr-document-report-list'
            },
            {
                key: 'company.document.feedbacks',
                name: 'Feedbacks',
                component: DocumentFeedback,
                path: '/company/document/feedbacks',
                template: 'main',
                // hide: true,
                permission: 'hr-document-feedback-list'
            },
            {
                key: 'company.document.read',
                name: 'Read',
                component: DocumentRead,
                path: '/company/document/read',
                template: 'main',
                // hide: true,
                permission: 'hr-document-read-list'
            },
            {
                key: 'company.document.form',
                name: 'Biểu mẫu',
                component: Document_Form,
                path: '/company/document/form',
                template: 'main',
                permission: 'hr-bieu-mau-list'
            },
            {
                key: 'company.document.communication.list',
                name: 'Communication',
                component: Communication,
                path: '/company/document/communication',
                template: 'main',
                permission: 'hr-communication-list'
            },
        ]
    },
    {
        key: 'company.document.create',
        name: 'Document Create',
        component: DocumentForm,
        path: '/company/document/create',
        template: 'main',
        hide: true,
    },
    {
        key: 'company.document.update',
        name: 'Document Update',
        component: DocumentForm,
        path: '/company/document/:id/edit',
        template: 'main',
        hide: true,
    },
    {
        key: 'company.document.communication.view.confirm',
        name: 'Communication View Confirm',
        component: CommunicationViewConfirm,
        path: '/company/document/communication/:id/view-confirm',
        template: 'main',
        hide: true
    },
];