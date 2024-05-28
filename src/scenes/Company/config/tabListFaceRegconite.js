import { checkPermission } from "~/services/helper";

// export default [
//     {
//         title: 'Face Regconite',
//         route: '/face-regconite',
//     },
//     {
//         title: 'Face Log',
//         route: '/face-log-debug',
//     },
//     // {
//     //     title: 'Bad Face',
//     //     route: '/bad-face',
//     // },
//     {
//         title: 'Cashier',
//         route:  '/cashier'
//     },
//     {
//         title: 'Receipts',
//         route:  '/order'
//     },
//     {
//         title: 'Face Log v2',
//         route: '/face-log-debug-v2',
//     },
// ];


export default function (props) {
    const { t } = props;
    let result = [];
    if(checkPermission('hr-tool-face-regconite-list')){
        result.push({
            title: t('hr:face_regconite'),
            route: '/face-regconite',
        })
    }
    if (checkPermission('hr-tool-face-regconite-log-list')) {
        result.push({
            title: 'face_log',
            route: '/face-log-debug',
        })
    }
    if (checkPermission('hr-tool-face-regconite-cashier-list')) {
        result.push({
            title: 'cashier',
            route:  '/cashier'
        })
    }
    if (checkPermission('hr-tool-face-regconite-receipt-list')) {
        result.push({
            title: t('hr:receipts'),
            route:  '/order'
        })
    }
    // if (checkPermission('hr-tool-face-regconite-log-list')) {
    //     result.push({
    //         title: t('face_log') + (' ') + 'v2',
    //         route: '/face-log-debug-v2',
    //     })
    // }
    if (checkPermission('hr-tool-face-regconite-log-list')) {
        result.push({
            title: t('face_log') + (' ') + 'v3',
            route: '/face-log-debug-v3',
        });
    }
    result.push({
        title: t('hr:face_detection'),
        route: '/customer/face-detect',
    });
    return result
}