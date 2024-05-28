import { trainingExamTypes, trainingQuestionInputTypes } from '~/constants/basic';

export const header = {
    'code': 'Question code',
    // 'title': 'Question title',
    'content': 'Question Content',
    'type': 'Type',
    'input_type': 'Option',
    'document_code': 'Document Code',
    'answers': 'Answers',
    'is_correct': 'Is Correct',
    'status': 'Status',
    'skill_id': 'Skill Id',
    'skill_code': 'Skill Code',
    'skill_name': 'Skill Name'
}

export function getHeader() {
    let result = [];
    Object.keys(header).map(key => {
        result.push(header[key]);
    });
    return [result];
}

export function formatData(data, baseData) {
    let result = [];
    data.map(question => {
        let row = [];
        Object.keys(header).map(key => {
            switch(key) {
                case 'content': 
                    row.push(question.content && question.content.replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/g, ' ')); 
                    break;
                case 'document_code':
                    row.push(question.document && question.document.document_code); break;

                case 'type':
                    let type = '';
                    if(question[key]) {
                        Object.keys(trainingExamTypes).map(t => {
                            if(t == question[key]) type = trainingExamTypes[t]
                        })
                    }
                    row.push(type); break;

                case 'input_type':
                    let inputType = '';
                    if(question[key]) {
                        Object.keys(trainingQuestionInputTypes).map(t => {
                            if(t == question[key]) inputType = trainingQuestionInputTypes[t];
                        });
                    }
                    row.push(inputType); break;

                case 'answers':
                    let details = question['detail'];
                    if(details.length) {
                        details.map( (d, indexAnswer ) => {
                            if(indexAnswer == 0) {
                                row.push(d.content) // Col answer
                                row.push(d.is_correct ? 'X' : '');  // Col is correct
                                row.push(question.status);
                                row.push(question.skill_id) // Col skill_id
                                row.push(question.skill?.code || '') // Col skill_code
                                row.push(question.skill?.name || '') // col skill name
                                result.push([...row])
                            } else {
                                let rowDefault = ['','','','','',''];
                                rowDefault.push(d.content)
                                if(d.is_correct) rowDefault.push('X');
                                result.push([...rowDefault])
                            }
                        }) 
                    } else {
                        row.push(''); // Col answer
                        row.push(''); // Col is correct
                        row.push(question.status);
                        row.push(question.skill_id) // Col skill_id
                        row.push(question.skill?.code || '') // Col skill_code
                        row.push(question.skill?.name || '') // col skill name
                        result.push([...row]);
                        break;
                    }
                    break;
                default:
                    row.push(question[key]); break;
            }
        });
    })

    return [...result];
} 

export default {
    getHeader,
    formatData
}