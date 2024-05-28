import store from '~/redux/store';
import { convertToSingleObject } from '~/services/helper';
import { skillStatus } from '~/constants/basic';
/**
 * XLS file header
 */
export const header = {
    'staff_name': 'Staff',
    'code': 'Code',
    'staff_dept_id': 'Department',
    'division_id': 'Section',
    'staff_loc_id': 'Location',
    'major_id': 'Major',
    'views': 'Views',
    'confirms': 'Confirms',
    'not_clears': 'Not Clears',
    'confirms_date': 'Confirm Date',
    'not_clears_date': 'Not Clears Date',
}

/**
 * List key need to convert to text
 */
let convertKeyToText = {
    'staff_dept_id': 'departments',
    'division_id': 'divisions',
    'staff_loc_id': 'locations',
    'major_id': 'majors'
};

/**
 * Format data from header
 * @param {Array} skillList 
 */
export function formatViewConfirm(datas, communication, confirmInteracts, notClearInteracts) {
    let { baseData } = store.getState();
    let baseFormat = {};
    Object.keys(baseData).map(key => {
        baseFormat[key] = convertToSingleObject(baseData[key]);
    });

    let data = [];
    datas.map((item, i) => {
        let exportData = [];
        Object.keys(header).map(key => {
            if (typeof item[key] !== 'undefined') {
                if (convertKeyToText[key]) {
                    let text = (item[key] != 0 && typeof baseFormat[convertKeyToText[key]][item[key]] !== 'undefined') ? baseFormat[convertKeyToText[key]][item[key]] : '';
                    exportData.push(text);
                } else {
                    exportData.push(item[key] ? item[key] : '');
                }

            } else {
                switch (key) {
                  case "views":
                    exportData.push(
                      communication?.views.includes(String(item.user_id)) ||
                        communication?.views.includes(Number(item.user_id))
                        ? "X"
                        : ""
                    );
                    break;
                  case "confirms":
                    exportData.push(
                      communication?.confirms.includes(String(item.user_id)) ||
                        communication?.confirms.includes(Number(item.user_id))
                        ? "X"
                        : ""
                    );
                    break;
                  case "not_clears":
                    exportData.push(
                      communication?.not_clears.includes(
                        String(item.user_id)
                      ) ||
                        communication?.not_clears.includes(Number(item.user_id))
                        ? "X"
                        : ""
                    );
                    break;
                  case "confirms_date":
                    if (
                      communication?.confirms.includes(String(item.user_id)) ||
                      communication?.confirms.includes(Number(item.user_id))
                    ) {
                      exportData.push(
                        confirmInteracts[item.user_id]
                          ? confirmInteracts[item.user_id].created_at
                          : ""
                      );
                    } else {
                      exportData.push("");
                    }
                    break;
                  case "not_clears_date":
                    if (
                      communication?.not_clears.includes(String(item.user_id)) ||
                      communication?.not_clears.includes(Number(item.user_id))
                    ) {
                      exportData.push(
                        notClearInteracts[item.user_id]
                          ? notClearInteracts[item.user_id].created_at
                          : ""
                      );
                    } else {
                      exportData.push("");
                    }
                    break;
                  default:
                    exportData.push("");
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
    formatViewConfirm
}