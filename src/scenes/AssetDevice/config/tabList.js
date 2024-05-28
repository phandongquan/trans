import { checkPermission } from "~/services/helper";

// export default [
//     {
//         title: 'Thiết bị tài sản',
//         route: '/asset-device',
//     },
//     {
//         title: 'Chi nhánh',
//         route: '/asset-device/locations',
//     },
//     {
//         title: 'Nhóm bộ phận',
//         route: '/asset-device/group',
//     },
//     {
//         title: 'Lịch sử bảo trì',
//         route: '/asset-device/log',
//     },
//     {
//         title: 'Thống kê',
//         route: '/asset-device/log/report',
//     },
//     {
//         title: 'QR Code',
//         route: '/qrcode/list',
//     },


// ]
export default function (props){
    let {t} = props;
    let result = [];
    if (checkPermission('hr-asset-device-list')){
        result.push({
            title: t('hr:asset_equipment'),
            route: '/asset-device',
        })
    }
    result.push({
        title: 'Thống kê thiết bị tài sản',
        route: '/asset-device/report',
    })
    if (checkPermission('hr-asset-device-location-list')) {
        result.push({
            title:  t('hr:branch'),
            route: '/asset-device/locations',
        })
    }
    if (checkPermission('hr-asset-device-group-list')) {
        result.push({
            title: t('hr:group') + (' ') + t('hr:maintenance'),
            route: '/asset-device/group',
        })
    }
    if (checkPermission('hr-asset-device-log-list')) {
        result.push({
            title: t('maintenance_history'),
            route: '/asset-device/log',
        })
    }
    if (checkPermission('hr-asset-device-report-list')) {
        result.push({
            title: t('statistic'),
            route: '/asset-device/log/report',
        })
    }
    if (checkPermission('hr-asset-device-qr-code-list')) {
        result.push({
            title: t('qr_code'),
            route: '/qrcode/list',
        })
    }
    if (checkPermission('hr-asset-device-location-detail-list')) {
        result.push({
            title:t('location') + (' ') + t('detail') ,
            route: '/location-detail',
        })
    }
    result.push({
        title: t('hr:maintenance') + (' ') + t('hr:device'),
        route: '/asset-device/maintenance',
    } )
    return result
}