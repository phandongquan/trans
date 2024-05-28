// export default [
//     {
//         title: 'Jobs',
//         route: '/company/job',
//     },
//     {
//         title: 'Candidates',
//         route: '/company/job/candidates',
//     },
//     {
//         title: 'Members',
//         route: '/company/job/members'
//     },
//     {
//         title: 'News',
//         route: '/company/news'
//     }
// ]

import { checkPermission } from "~/services/helper"

export default function (props){
    const { t } = props;
    let result = [];
    if (checkPermission('hr-job-list')){
        result.push({
            title: t('hr:job'),
            route: '/company/job',
        })
    }
    if (checkPermission('hr-job-candidate-list')){
        result.push({
            title: t('hr:candidate'),
            route: '/company/job/candidates',
        })
    }
    if (checkPermission('hr-job-member-list')){
        result.push({
            title: t('hr:member'),
            route: '/company/job/members'
        })
    }
    if (checkPermission('hr-job-new-list')) {
        result.push({
            title: t('hr:news'),
            route: '/company/news'
        })
    if (checkPermission('hr-job-evaluation-criteria-list')){
        result.push({
            title: t('hr:evaluation_criteria'),
            route: '/company/job/evaluation-criteria'
        })
    }}
    if (checkPermission('hr-job-specific-questions-list')) {
        result.push({
            title: t('hr:specific_questions'),
            route: '/company/job/specific'
        })
    }
    return result
}