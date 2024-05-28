import store from '~/redux/store';
import { dateFormat } from "~/constants/basic";
import { timeFormatStandard } from "~/services/helper";
import { convertToSingleObject } from '~/services/helper';
import { skillStatus } from '~/constants/basic';

export const headers = {
    'id' : 'Id',
    'code' : 'Code',
    'parent' : 'Parent Code',
    'name' : 'Skill Name',
    'department' : 'Department',
    'section' : 'Section',
    'priority' : 'Priority',
    'status' : 'Status',
    'sku_service': 'SKU Service',
    'score' : 'Weight',
    'cost':'Skill cost',
}

const processData = () => {
    let { baseData: { majors } } = store.getState();
    const sortMajorOrder = [
        'Quản lý khu vực',
        'Quản lý cửa hàng',
        'Nhân viên Mỹ Phẩm',
        'Đóng gói',
        'Phát triển cửa hàng',
        'CSKH Cosmetic',
        'Tư vấn Clinic',
        'Quản lý chi nhánh (Clinic)',
        'CSKH Clinic',
    ];

    // Sort the majors array based on the custom order
    majors.sort((a, b) => {
        const indexA = sortMajorOrder.indexOf(a.name);
        const indexB = sortMajorOrder.indexOf(b.name);

        if (indexA === -1) {
            return 1; // Move items not in the custom order to the end
        }
        if (indexB === -1) {
            return -1; // Move items not in the custom order to the end
        }

        return indexA - indexB;
    });

    return majors;
};
/**
 * 
 * @returns 
 */
export function getHeader() {
    let majors = processData();
    let result = [];
    Object.keys(headers).map(key => {
        result.push(headers[key]);
    });

    majors.forEach((m) => {
        result.push(m.name);
    });

    return [result];
}

export function getSumHeaders(length = 0)
{
    let majors = processData();
    let result = [];
    Object.keys(headers).map(key => {
        if(key == 'parent') {
            result.push('   ');
        } else {
            result.push('');
        }
    });
    majors.forEach((m, index) => {
        let columnName = printString(Object.keys(headers).length + 1 + index);
        result.push({formula: '=SUBTOTAL(9,'+ columnName +'3:'+ columnName + (length + 3) +')'});
    });

    return [result];
}

function printString(columnNumber)
{
    // To store result (Excel column name)
        let columnName = [];
  
        while (columnNumber > 0) {
            // Find remainder
            let rem = columnNumber % 26;
  
            // If remainder is 0, then a
            // 'Z' must be there in output
            if (rem == 0) {
                columnName.push("Z");
                columnNumber = Math.floor(columnNumber / 26) - 1;
            }
            else // If remainder is non-zero
            {
                columnName.push(String.fromCharCode((rem - 1) + 'A'.charCodeAt(0)));
                columnNumber = Math.floor(columnNumber / 26);
            }
        }

        return columnName.reverse().join("");
}

/**
 * 
 * @param {*} datas 
 * @returns 
 */
export function formatDataSkillBonus(datas = []) {
    let { baseData: { departments , divisions } } = store.getState();
    let majors = processData();
    let result = [];
    Object.keys(datas).forEach((key) => {
        const item = datas[key];
        let costConfigs = item.cost_configs;
        let row = [];
        Object.keys(headers).forEach((key) => {
            switch (key) {
                case "sku_service":
                    row.push(item[key] ?? '');
                    break;
                case "cost":
                    if(item[key]==="") {
                        row.push(' ')
                    } else {
                        row.push(Number(item[key]));
                    }
                    break;
                case "parent":
                    row.push(item[key]?.code ?? '');
                    break;
                case "status":
                    row.push(skillStatus[item[key]]);
                    break;
                case 'department':
                    let deparment = departments.find(d => item.department_id == d.id);
                    let deptName = deparment ? deparment.name : 'NA';
                    row.push(deptName)
                    break;
                case 'section':
                    let division = divisions.find(d => item.division_id == d.id)
                    let divName = division ? division.name : 'NA';
                    row.push(divName)
                    break;
                default : 
                    row.push(item[key]);
                    break;
            }
           
        });
        majors.map(m => {
            if (Array.isArray(costConfigs)) {
                let config = costConfigs.find(c => c.major_id == m.id);
                if(config) {
                    if(config.cost==="")
                        row.push(' ');
                    else
                        row.push(Number(config.cost));
                } else {
                    row.push(' ');
                }
            } else {
                row.push(' ');
            }
        })
        result.push(row)
    });
    return [...result];
}
export const styleFillYellow = {
    type: 'pattern',
    pattern:'solid',
    fgColor:{argb:'FFF2CC'}
}

export const styles = {
    row: {
        1: {
            width: 90, 
            height: 30, 
            font: { bold: true }, 
            alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
            border: {
                top: {style:'thin'},
                left: {style:'thin'},
                bottom: {style:'thin'},
                right: {style:'thin'}
            }
        },
        // if row cell has 0 value, set style to yellow
        
    },
    col: {
        2: { width: 15 },
        4: { width: 70 },
        6: { width: 15 },
    },
}