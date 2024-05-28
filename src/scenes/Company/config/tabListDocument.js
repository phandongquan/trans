import { checkPermission } from "~/services/helper";

// export default [
//     {
//         title: 'Documents',
//         route: '/company/document',
//     },
//     {
//         title: 'Master List',
//         route: '/company/document/master-list',
//     },
//     {
//         title: 'Categories',
//         route: '/company/document/categories'
//     },
//     {
//         title: 'Types',
//         route: '/company/document/types'
//     },
//     {
//         title: 'Report',
//         route: '/company/document/report'
//     },
//     {
//         title: 'Feedbacks',
//         route: '/company/document/feedbacks'
//     },
//     {
//         title: 'Read',
//         route: '/company/document/read'
//     },
// ];


export default function (props) {
    const { t } = props;
    let result = [];
    if (checkPermission('hr-document-list')) {
        result.push({
            title: t('hr:document'),
            route: '/company/document',
        })
    }
    if (checkPermission('hr-document-master-list')) {
        result.push({
            title: t('hr:master_list'),
            route: '/company/document/master-list',
        })
    }
    if (checkPermission('hr-document-categories-list')) {
        result.push({
            title: t('hr:category'),
            route: '/company/document/categories'
        })
    }
    if (checkPermission('hr-document-type-list')) {
        result.push({
            title: t('hr:type'),
            route: '/company/document/types'
        })
    }
    if (checkPermission('hr-document-report-list')) {
        result.push({
            title: t('hr:report'),
            route: '/company/document/report'
        })
    }
    if (checkPermission('hr-document-feedback-list')) {
        result.push({
            title: t('feedback'),
            route: '/company/document/feedbacks'
        })
    }
    if (checkPermission('hr-document-read-list')) {
        result.push({
            title: t('hr:read_log'),
            route: '/company/document/read'
        })
    }
    if (checkPermission('hr-bieu-mau-list')) {
        result.push({
            title: t('hr:document_form'),
            route: '/company/document/form'
        })
    }
    if (checkPermission('hr-communication-list')) {
        result.push({
            title: t('hr:communication'),
            route: '/company/document/communication'
        })
    }
    return result;
}