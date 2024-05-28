export default function (id, props) {
    const { t } = props;
    return [
        {
            title: t('hr:edit') + ' ' + t("hr:skill"),
            route: `/company/skill/${id}/edit`,
            disable: true
        },
        {
            title: t('hr:staff_list'),
            route: `/company/skill/${id}/staff`,
        },
        {
            title: t('hr:examination_list'),
            route: `/company/skill/${id}/exam`,
        },
        // {
        //     title: 'Staff History List',
        //     route: `/company/skill/${id}/staff/history`,
        // },
        {
            title: t('hr:request_skill'),
            route: `/company/skill/detail/request-upraise/${id}`,
        },
    ]
}