import store from '~/redux/store';
import { convertToSingleObject } from '~/services/helper';
import { skillStatus } from '~/constants/basic';
/**
 * XLS file header
 */
export const header = {
    // 'counter': 'No.',
    'id': 'Id',
    'code': 'Code',
    'parent_code': 'Parent Code',
    'name': 'Skill Name',
    'department_id': 'Department',
    'division_id': 'Division',
    'major_id': 'Major',
    'position_id': 'Position',
    'priority': 'Priority',
    'is_required_100': 'Required Skill',
    'status': 'Status',
    'cost': 'Cost',
    'score': 'Weight',
    'sku_service': 'SKU Service',
    'documents_count': 'Documents',
    'document_link': 'Document Link'
}

/**
 * List key need to convert to text
 */
let convertKeyToText = {
    'department_id': 'departments',
    'division_id': 'divisions',
    'position_id': 'positions',
    // 'major_id': 'majors',
    'status': 'skillStatus',
};

/**
 * Format data from header
 * @param {Array} skillList 
 */
export function formatSkill(skillList) {
    let { baseData } = store.getState();
    let baseFormat = {};
    Object.keys(baseData).map(key => {
        baseFormat[key] = convertToSingleObject(baseData[key]);
    });
    baseFormat['skillStatus'] = skillStatus;
    let data = [];
    Object.keys(skillList).map((keyList, i) => {
        let skill = skillList[keyList];
        let exportData = [];
        Object.keys(header).map(key => {
            if (typeof skill[key] !== 'undefined') {
                if (convertKeyToText[key]) {
                    let text = (skill[key] != 0 && typeof baseFormat[convertKeyToText[key]][skill[key]] !== 'undefined') ? baseFormat[convertKeyToText[key]][skill[key]] : '';
                    exportData.push(text);
                } else {
                    if(key == 'major_id'){
                        let result = []
                        skill[key].map(id => {
                            let marjorFind = (baseData.majors).find(m=> m.id == id)
                            result.push(marjorFind ? marjorFind.name : '');
                        })
                        exportData.push(result.toString());
                    }else{
                        exportData.push(skill[key] ? skill[key] : '');
                    }
                }

            } else {
                switch (key) {
                    case 'counter':
                        exportData.push(++i);
                        break;
                    case 'parent_code':
                        exportData.push(skill.parent?.code);
                        break;
                    case 'document_link':
                        let link = '';
                        if(skill.documents_count) {
                            link = `https://hr.hasaki.vn/company/document?skill_id=${skill.id}`
                        }
                        exportData.push(link)
                        break;
                    default:
                        exportData.push('');
                        break;
                }

            }
        });
        data.push(exportData);
    });
    return data;
}

export default {
    header,
    formatSkill
}