import { checkPermission } from "~/services/helper";

// export default [
//     {
//         title: 'Training Examination',
//         route: '/company/training-examination',
//     },
//     {
//         title: 'Training Examination Result',
//         route: '/company/training-examination/result'
//     },
//     {
//         title: 'Training Question',
//         route: '/company/trainning-question'
//     },
//     {
//         title:'Training Question Feedbacks',
//         route: '/company/training-question/feedbacks'
//     }
//     // {
//     //     title: 'Tự động thi',
//     //     route: '/company/training-examination/list-exam'
//     // }


// ];
export default function (props) {
    const { t } = props;
    let result = [];
    if (checkPermission('hr-training-examination-list')){
        result.push({
            title: t('hr:training_exam'),
            route: '/company/training-examination',
        })
    }
    if (checkPermission('hr-examination-result-list')) {
        result.push({
            title: t('hr:training_examination_result'),
            route: '/company/training-examination/result'
        })
    }
    if (checkPermission('hr-trainning-question-list')) {
        result.push({
            title: t('hr:training_question'),
            route: '/company/trainning-question'
        })
    }
    if (checkPermission('hr-trainning-feedback-list')) {
        result.push({
            title: t('hr:training_question_feedbacks'),
            route: '/company/training-question/feedbacks'
        })
    }
    if (checkPermission('hr-training-plan-list')) {
        result.push({
            title: t('hr:training_plan'),
            route: '/company/training-plan'
        })
    }
    if (checkPermission('hr-training-report-list')) {
        result.push({
            title: t('hr:training_report'),
            route: '/company/training-report'
        })
    }
    return result;
}
