import { checkPermission } from "~/services/helper"

// export default [
//     {
//         title: 'News',
//         route: `/company/news`,
//     },
//     {
//         title: 'Categories',
//         route: '/company/news/categories'
//     }
// ]

export default function (props) {
    const { t } = props;
    let result = []
    if (checkPermission('hr-job-new-list')) {
        result.push({
            title: t('hr:news'),
            route: `/company/news`,
        })
    }
    if (checkPermission('hr-job-new-categories-list')) {
        result.push({
            title: t('hr:category'),
            route: '/company/news/categories'
        })
    }
    if (checkPermission('hr-job-new-categories-list')) {
        result.push({
            title: t('hr:question'),
            route: '/company/news/questions'
        })
    }
    return result
}