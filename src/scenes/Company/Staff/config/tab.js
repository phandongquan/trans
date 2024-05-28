import history from '~/redux/history';
import { checkPermission } from '~/services/helper';

export default function (id,props) {
    const { t } = props;
    let tabs = [
        {
            title: t('hr:edit_staff'),
            route: `/company/staff/${id}/edit`,
        },
        // {
        //     title: 'Skill',
        //     route: `/company/staff/${id}/skill`,
        //     disable: true,
        // },
        // {
        //     title: 'Relationship',
        //     route: `/company/staff/${id}/relationship`,
        //     disable: true
        // },
        // {
        //     title: 'Specialized',
        //     route: `/company/staff/${id}/specialized`,
        //     disable: true
        // },
        // {
        //     title: 'Practising Certificate',
        //     route: `/company/staff/${id}/practising-certificate`,
        //     disable: true
        // },
        // {
        //     title: 'History',
        //     route: `/company/staff/${id}/history`,
        //     disable: true
        // },
        // {
        //     title: 'Salary Config',
        //     route: `/company/staff/${id}/salary-config`,
        //     disable: true
        // },
        // {
        //     title: 'Adjustment',
        //     route: `/company/staff/${id}/adjustment`,
        //     disable: true
        // }
    ];
    if (checkPermission('hr-staff-detail-skill-list') || checkPermission('hr-skill-update')) {
        tabs.push({
            title: t('hr:skill'),
            route: `/company/staff/${id}/skill`,
            disable: true,
        })
    }
    if (checkPermission('hr-staff-detail-relationship-list')) {
        tabs.push({
            title: t('hr:relationship'),
            route: `/company/staff/${id}/relationship`,
            disable: true
        })
    }
    if (checkPermission('hr-staff-history-list')) {
        tabs.push({
            title: t('hr:history'),
            route: `/company/staff/${id}/history`,
            disable: true
        })
    }
    if (checkPermission('hr-staff-salary-config-list')) {
        tabs.push({
            title: t('hr:salary_config'),
            route: `/company/staff/${id}/salary-config`,
            disable: true
        })
    }
    if (checkPermission('hr-staff-detail-specialized-list')) {
        tabs.push({
            title: t('hr:specialized'),
            route: `/company/staff/${id}/specialized`,
            disable: true
        })
    }
    if (checkPermission('hr-staff-detail-adjustment-list')) {
        tabs.push({
            title: t('hr:adjustment'),
            route: `/company/staff/${id}/adjustment`,
            disable: true
        })
    }
    tabs.push({
        title: "Balance",
        route: `/company/staff/${id}/balance`,
        disable: true,
    });

    tabs.push({
        title: t("hr:training_plan"),
        route: `/company/staff/${id}/training-plan`,
        disable: true,
    });

    tabs.push({
        title: t("hr:employee_performance"),
        route: `/company/staff/${id}/performance`,
        disable: true,
    });
    tabs.push({
        title: t("hr:external_account"),
        route: `/company/staff/${id}/external-account`,
        disable: true,
    })


    return tabs;
}