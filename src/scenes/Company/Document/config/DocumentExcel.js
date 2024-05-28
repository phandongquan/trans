import { dateTimeFormat, staffStatus } from '~/constants/basic';
import { parseIntegertoTime } from '~/services/helper';

export const header = {
    'id': 'Id',
    'document_code': 'Code',
    'title': 'Title',
    'category': 'Category',
    'department_id': 'Department',
    'skill': 'Skill',
    'rating_avg': 'Rating',
    'view_counter': 'View Counter',
    'created_at': 'Created At',
    'created_by': 'Created By',
    'updated_at': 'Updated At',
    'updated_by': 'Updated By',
    'published_at': 'Published At',
    'published_by': 'Published By',
    'status': 'Status',
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
    let { departments, status } = baseData;
    data.map(obj => {
        let row = [];
        Object.keys(header).map(key => {
            switch(key) {
                case 'department_id':
                    let departmentName = 'All Department';
                    departments.map(d => {
                        if(d.id == obj[key]) {
                            return departmentName = d.name;
                        }
                    });
                    row.push(departmentName); break;

                case 'skill':
                    // let skill = typeof obj[key] != 'undefined' ? obj[key] : [];
                    // if (typeof skill == 'undefined' || skill.length <= 0) {
                    //     row.push(''); break;
                    // }
                    // let result = [];
                    // skill.map(obj => result.push(obj.name));
                    // row.push(result.join('\n')); break;

                    row.push(obj[key]?.name); 
                    break;

                case 'created_by': 
                    if(obj['user']) {
                        row.push(`${obj['user'].name} # ${obj['user'].id}`);
                    } else {
                        row.push('');
                    }
                    break;

                case 'updated_by':
                    if(obj[key] && typeof obj[key] == 'object') {
                        row.push(`${obj[key].name} # ${obj[key].id}`);
                    } else {
                        row.push('');
                    }
                    break;
                
                case 'published_by':
                    if (obj[key] && typeof obj[key] == 'object') {
                        row.push(`${obj[key].name} # ${obj[key].id}`);
                    } else {
                        row.push('');
                    }
                    break;
                    
                case 'published_at':
                    row.push( parseIntegertoTime(obj[key], dateTimeFormat) ); break;

                case 'status':
                    row.push(obj[key] && status[obj[key]]); break;

                default:
                    row.push(obj[key]); break;
            }
        });

        result.push([...row])
    })

    return [...result];
} 

export default {
    getHeader,
    formatData
}