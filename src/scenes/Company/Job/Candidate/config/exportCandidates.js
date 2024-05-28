import { parseIntegertoTime } from '~/services/helper';
import { jobCandidateStatus, typeInterviewResult } from '~/constants/basic';

export const header = {
    'member_name' : 'Name',
    'member_email' : 'Email',
    'member_phone' : 'Phone',
    'member_address' : 'Address',
    'job_title' : 'Job title',
    'interview_result' : 'Interview Result',
    'test_result' : 'Test result',
    'status' : 'Status',
    'created' : 'Applied date',
    'wfid' : 'Workfow'
}

export function formatHeader() {
    let headers = [] 
    Object.keys(header).map((key, i) => {
        headers.push(header[key]);
    });
    return [headers];
}

export function formatData(datas , workflows) {
    let result = [];

    datas.map(d => {
        let row = []
        Object.keys(header).map(key => {
            switch(key) {
                case 'status':
                    row.push(jobCandidateStatus[d[key]]);
                    break;
                case 'created':
                    row.push(parseIntegertoTime(d[key] , 'YYYY-MM-DD HH:mm:ss'));
                    break;
                case 'wfid':
                    row.push(workflows[d[key]]);
                    break;
                case 'interview_result':
                    row.push(typeInterviewResult[d[key]])
                    break;
                case 'test_result':
                    row.push(typeInterviewResult[d[key]])
                    break;  
                default:
                    row.push(d[key]);
                    break;
            }
        })
        result.push(row)
    })
    return result;
}