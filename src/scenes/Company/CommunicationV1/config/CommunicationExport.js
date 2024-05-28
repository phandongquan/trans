import { dateTimeFormat } from '~/constants/basic';
import { parseIntegertoTime } from '~/services/helper';

export const header = {
    'title': 'Title',
    'category' : 'Category',
    'department_id' : 'Department',
    'status' : 'Status', 
    'views' : 'Views',
    'confirms' : 'Confirms',
    'not_clears' : 'Not clears',
    'total_staffs':'Total staffs',
    'created_at' : 'Created date',
    'created_by': 'Created By',
    'updated_at': 'Updated At',
    'updated_by': 'Updated By',
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
    let { departments, divisions } = baseData;
    data.map(obj => {
        let row = [];
        Object.keys(header).map(key => {
            switch (key) {
                case 'status':
                    row.push(obj[key] == 1 ? 'Active' : 'InActive')
                    break;
                case 'views':
                    row.push(obj[key].length)
                    break;
                    case 'confirms':
                    row.push(obj[key].length)
                    break;
                    case 'not_clears':
                    row.push(obj[key].length)
                    break;
                case 'category':
                    row.push(obj[key]?.name)
                    break;
                case 'department_id':
                    let departmentName = 'All Department';
                    let result = [];
                    obj[key].map(id =>{
                        departments.map(d => {
                            if(d.id == id ){
                                result.push(d.name)
                            }
                        })
                        let divFound = divisions.find(d => d.id == id);
                        if(divFound) {
                            result.push(divFound.name)
                        }
                    })
                    row.push(result.length ? result.toString() : departmentName); break;
                case 'created_by':
                    if (obj['created_by_user']) {
                        row.push(`${obj['created_by_user'].name} # ${obj['created_by_user'].id}`);
                    } else {
                        row.push('');
                    }
                    break;

                case 'updated_by':
                    if (obj['updated_by_user'] && typeof obj['updated_by_user'] == 'object') {
                        row.push(`${obj['updated_by_user'].name} # ${obj['updated_by_user'].id}`);
                    } else {
                        row.push('');
                    }
                    break;
                default:
                    row.push(obj[key]); break;
            }
        })
        result.push([...row])
    })

    return [...result];
}