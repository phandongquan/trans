// export default [
//     {
//         title: 'Log play music',
//         route: '/log-play-music'
//     },
//     {
//         title: 'Music',
//         route: '/music'
//     },
//     {
//         title: 'Advertisment',
//         route: '/advertisment'
//     }

import { checkPermission } from "~/services/helper"

// ];
export default function (props) {
    let result = []
    const { t } = props;
    if (checkPermission('hr-log-play-music-list')) {
        result.push({
            title: t('hr:log_play_music'),
            route: '/log-play-music'
        })
    }
    if (checkPermission('hr-log-music-list')) {
        result.push({
            title: t('music'),
            route: '/music'
        })
    }
    if (checkPermission('hr-log-video-list')) {
        result.push({
            title: t('video'),
            route: '/video'
        })
    }
    if (checkPermission('hr-log-music-advertisement-list')) {
        result.push({
            title: t('advertisment'),
            route: '/advertisment'
        })
    }
    return result
}