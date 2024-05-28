import { checkPermission } from "~/services/helper"

// export default function (is_Manager) {
//     let result = [
//         {
//             title: 'Feedback',
//             route: '/social/feedbacks',
//         }
//     ];
//     if (is_Manager) {
//         result.push({
//             title: 'Config',
//             route: '/social/feedbacks/config',
//         })
//     }
//     return result;
// }
export default function (props) {
    const {t} = props
    let result = []
    if (checkPermission('hr-feedback-list')) {
        result.push({
            title: t('feedback'),
            route: '/social/feedbacks',
        })
    }
    if (checkPermission('hr-feedback-config-list')) {
        result.push({
            title: t('config'),
            route: '/social/feedbacks/config',
        })
    }
    return result
}