import { checkPermission } from "~/services/helper";

export default function (id) {
    let tabs = [
        {
            title: 'Edit Job',
            route: `/company/job/${id}/edit`,
        },
        {
            title: 'Candidate',
            route: `/company/job/${id}/apply`,
            disable: true
        },
    ];
    if (checkPermission('hr-job-detail-evalution-criteria-list')){
        tabs.push({
            title: 'Evaluation Criteria',
            route: `/company/job/${id}/evaluation-criteria`,
        })
    }
    return tabs;
}