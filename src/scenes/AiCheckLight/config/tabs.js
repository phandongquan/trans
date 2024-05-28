import { checkPermission } from "~/services/helper"

// export default [
//     {
//         title: 'Camera shop',
//         route: `/camera-shop`,
//     },
//     {
//         title: 'Nodes computer',
//         route: `/group-camera-shop`,
//     },
// ];

export default function (props) {
    let result = [];
    const { t } = props;
    if (checkPermission('hr-tool-camera-shop-list')) {
        result.push({
            title: t('camera_shop'),
            route: `/camera-shop`,
        })
    }
    if (checkPermission('hr-tool-group-camera-shop-list')) {
        result.push({
            title: t('nodes_computer'),
            route: `/group-camera-shop`,
        })
    }
    console.log(result)
    return result
}