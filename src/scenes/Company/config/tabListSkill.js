// export default [
//     {
//         title: 'Skill',
//         route: '/company/skill'
//     },
//     {
//         title: 'Skill Report',
//         route: '/company/skill/report'
//     },
//     {
//         title: 'Skill Bonus',
//         route: '/company/skill/bonus'
//     },
//     {
//         title: 'Skill Log',
//         route: '/company/skill/log'
//     },
//     {
//         title: 'Request Skill',
//         route: '/company/skill/request-upraise'
//     }

import { checkPermission } from "~/services/helper";

// ];
export default function (props){ 
    const { t } = props;
    let result = [] ; 
    if (checkPermission('hr-skill-list')){
        result.push({
            title: t('hr:skill'),
            route: '/company/skill'
        })
    }
    if(checkPermission('hr-skill-category-list')){
        result.push({
            title : t('hr:skill_category'),
            route : '/company/skill/category'
        })
    }
    if (checkPermission('hr-skill-report-list')) {
        result.push({
            title: t('hr:skill_report'),
            route: '/company/skill/report'
        })
    }
    if (checkPermission('hr-skill-bonus-list')) {
        result.push({
            title: t('hr:skill_bonus'),
            route: '/company/skill/bonus'
        })
    }
    if(checkPermission('hr-skill-log-list')){
        result.push({
            title: t('hr:skill_log'),
            route: '/company/skill/log'
        })
    }
    if (checkPermission('hr-request-skill-list')){
        result.push({
            title: t('hr:request_skill'),
            route: '/company/skill/request-upraise'
        })
    }
    return result;
}