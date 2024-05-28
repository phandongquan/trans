import { timeFormatStandard } from '~/services/helper';
import store from '~/redux/store';

export const header = {
    'count': 'No',
    'type': 'Type',
    'category_id': 'Category',
    'control_no': 'Control No',
    'title': 'Title of document',
    'distributed': 'Established Dept',
    'document_code': 'Code INS',
    'created_at': 'Established date',
    'updated_at': 'Revised date',
    'revised_number': 'Revised No.',
    'published_by': 'Approved by',
    'major_id': 'Distributed Major',
    'pdf': 'PDF',
    'video': 'Video',
    'question': 'Question',
    'link': 'Link tài liệu'
}

export function getHeader() {
    let result = [];
    Object.keys(header).map(key => {
        result.push(header[key]);
    });
    return [result];
}

export function formatData(data, dataRelate = {}) {
    let result = [];
    let { baseData: { departments, majors } } = store.getState();
    let { types, categories } = dataRelate;
    data.map((obj, i) => {
        let row = [];
        Object.keys(header).map(key => {
            switch(key) {
                case 'count':
                    row.push(++i);
                    break;
                case 'type':
                    row.push(types[obj[key]]);
                    break;
                case 'category_id':
                    row.push(categories[obj[key]]);
                    break;
                case 'distributed':
                    let deptFound = departments.find(d => d.id == obj[key])
                    row.push(deptFound?.name || '');
                    break;
                case 'created_at':
                    row.push(timeFormatStandard(obj[key], 'DD/MM/YYYY'))
                    break;
                case 'updated_at':
                    row.push(timeFormatStandard(obj[key], 'DD/MM/YYYY'))
                    break;
                case 'revised_number':
                    row.push(obj[key] || '')
                    break;
                case 'published_by':
                    row.push(obj.published_by_user?.name);
                    break;
                case 'major_id':
                    let majorFound = majors.find(m => m.id == obj[key])
                    row.push(majorFound?.name || '');
                    break;
                case 'pdf':
                    if(!obj.chapters.length) {
                        return 0;
                    }
                    let countPdf = obj.chapters.filter(c => c.type == 'pdf').length;
                    row.push(countPdf || '')
                    break;
                case 'video':
                    if(!obj.chapters.length) {
                        return 0;
                    }
                    let countVideo = obj.chapters.filter(c => c.type == 'video').length;
                    row.push(countVideo || '')
                    break;
                case 'question':
                    row.push(obj.questions?.length || '')
                    break;
                case 'link':
                    row.push(`https://hr.hasaki.vn/company/document/${obj.id}/edit`) 
                    break;
                default:
                    row.push(obj[key]); break;
            }
        });

        result.push([...row])
    })

    return [...result];
} 

function countPercent(doc, type) {
    if(!doc.chapters.length) {
        return ''
    }
    let totalChapter = doc.chapters.length;
    let countType = doc.chapters.filter(c => c.type == type).length;
    return ((countType * 100) / totalChapter).toFixed()
}

export default {
    getHeader,
    formatData
}