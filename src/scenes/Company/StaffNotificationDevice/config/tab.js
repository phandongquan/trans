
export default function (props) {
    const { t } = props;
    
    let result =[ {
        title: t('hr:device'),
        route: '/company/staff-notification-device',
    },
    {
        title: t('hr:notification'),
        route: '/company/staff-notification',
    }];

    return result;
}
