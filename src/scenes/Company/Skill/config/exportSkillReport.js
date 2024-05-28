import store from '~/redux/store';
import dayjs from 'dayjs';

let totals = {};

const header = {
    no: 'No.',
    name: 'Nhân viên',
    deptName: 'Bộ phận',
    majorName: "Nghiệp vụ",
    locName : "Chi nhánh",
    code: 'Code',
    staff_hire_date:'Working month',
    percent_consult: 'Tỷ lệ hoàn thành kỹ năng tham khảo',
    percent_complete: 'Tỷ lệ hoàn thành kỹ năng bắt buộc',

}

/**
 * 
 * @param {*} skills 
 * @returns 
 */
export function formatHeader(skills) {
    let merges = [];
    let hRow1 = [];
    let hRow2 = [];

    let stackIndex = 0;

    Object.keys(header).map(key => {
        hRow1.push(header[key]);
        hRow2.push('');
        let headerCoordinate = numberToLetters(stackIndex);
        merges.push(`${headerCoordinate}1:${headerCoordinate}2`);

        stackIndex += 1;
    });

    skills.map(skill => {
        if (skill.children) {
            if (skill.children.length > 1) {
                skill.children.map((child, childIndex) => {
                    if (!childIndex) {
                        hRow1.push(skill.name);
                    } else {
                        hRow1.push('');
                    }
                    hRow2.push(child.name);
                });
                let fCoordinate = numberToLetters(stackIndex);
                let lCoordinate = numberToLetters(stackIndex + skill.children.length - 1);
                merges.push(`${fCoordinate}1:${lCoordinate}1`);
            } else {
                let child = skill.children[0];
                hRow1.push(skill.name);
                hRow2.push(child.name);
            }

            stackIndex += skill.children.length;
        } else {
            hRow1.push(skill.name);
            hRow2.push('');
            let colCoordinate = numberToLetters(stackIndex);
            merges.push(`${colCoordinate}1:${colCoordinate}2`);
            stackIndex += 1;
        }
    })

    return {
        header: [hRow1, hRow2],
        merges,
    };
}

/**
 * 
 * @param {*} datas 
 * @returns 
 */
export function formatData(datas, skills) {
    let { baseData: { departments, locations, majors } } = store.getState();
    let styles = getStyles();

    totals = {}; // reset totals
    let result = [];

    datas.map((r, index) => {
        let deparment = departments.find(d => r.staff_dept_id == d.id);
        let deptName = deparment ? deparment.name : 'NA';
        let major = majors.find(d => r.major_id == d.id)
        let majorName = major ? major.name : 'NA';
        let location = locations.find(l => r.staff_loc_id == l.id)
        let locName = location ? location.name : 'NA';
        let staffMajorId = r.major_id;
        let rows = [];
        //
        let startRowIndex = index + 5;
        let stackIndex = 0;

        Object.keys(header).map(key => {
            switch (key) {
                case 'no':
                    rows.push(index + 1);
                    break;
                case 'name':
                    rows.push(
                        `${r.staff_name}`
                    );
                    break;
                case "code":
                    rows.push(`${r.code}`);
                    break;
                case 'staff_hire_date':
                    rows.push(`${r.staff_hire_date ? dayjs().diff(dayjs(r.staff_hire_date * 1000), 'months', true).toFixed(1) : ''}`);
                    break;
                case "deptName":
                    rows.push(`${deptName}`);
                    break;
                case "majorName":
                    rows.push(`${majorName}`);
                    break;
                case "locName":
                    rows.push(`${locName}`);
                    break;
                case 'percent_consult':
                    rows.push(`${r.quantity_skill_extra}/${r.total_skill_extra}`);
                    break;
                case 'percent_complete':
                    rows.push(`${r.quantity_skill}/${r.total_skill}`);
                    break;
                default:
                    rows.push('');
                    break;
            }

            stackIndex += 1;
        })

        skills.map(skill => {
            let level = 0;
            let isRequired = false;
            let isExtra = false;
            // Default coordinate
            let coordinate = numberToLetters(stackIndex);
            if (skill.children) {
                if (skill.children.length > 1) {
                    skill.children.map((child, ind) => {
                        // Re-Calculate coordinate if have children
                        coordinate = numberToLetters(stackIndex + ind);
                        isRequired = checkIsRequired(child, staffMajorId);
                        isExtra = checkIsExtra(child, staffMajorId);
                        level = r[`skill_${child.id}`] ? r[`skill_${child.id}`] : 0;
                        level = parseInt(level);

                        if (isRequired) {
                            styles['cell'][`${coordinate}${startRowIndex}`] = getStyleRequired(level);
                        } else if (isExtra) {
                            styles['cell'][`${coordinate}${startRowIndex}`] = getStyleExtra(level);
                        } else {
                            styles['cell'][`${coordinate}${startRowIndex}`] = getStyleDefault(level);
                        }

                        addTotal(stackIndex + ind, isRequired, isExtra, level);
                        rows.push(level);
                    });
                } else {
                    let child = skill.children[0];
                    isRequired = checkIsRequired(child, staffMajorId);
                    isExtra = checkIsExtra(child, staffMajorId);
                    level = r[`skill_${child.id}`] ? r[`skill_${child.id}`] : 0;
                    level = parseInt(level);
                    if (isRequired) {
                        styles['cell'][`${coordinate}${startRowIndex}`] = getStyleRequired(level);
                    } else if (isExtra) {
                        styles['cell'][`${coordinate}${startRowIndex}`] = getStyleExtra(level);
                    } else {
                        styles['cell'][`${coordinate}${startRowIndex}`] = getStyleDefault(level);
                    }
                    addTotal(stackIndex, isRequired, isExtra, level);
                    rows.push(level);
                }
                stackIndex += skill.children.length;
            } else {
                level = parseInt(level);

                styles['cell'][`${coordinate}${startRowIndex}`] = getStyleDefault(level);
                rows.push(level);
                addTotal(stackIndex, isRequired, isExtra, level);
                stackIndex += 1;
            }
        });

        result.push([...rows]);
    })
    let totalRow3 = ['Tổng kỹ năng bắt buộc', '', '', '', '', '', '', '', '' ];
    let totalRow4 = ['Tổng kỹ năng tham khảo', '', '', '', '', '', '', '', ''];
    Object.keys(totals).map(i => {
        totalRow3.push(`${totals[i]['count_required']}/${totals[i]['total_required']}`);
        totalRow4.push(`${totals[i]['count_extra']}/${totals[i]['total_extra']}`);
    });

    result.unshift(totalRow4);
    result.unshift(totalRow3);

    return { datas: result, styles };
}

/**
 * Calculate total skill required and extra to create 2 rows 'Tổng kỹ năng bắt buộc', 'Tổng kỹ năng tham khảo'
 * 
 * @param {number} colIndex 
 * @param {boolean} isRequired 
 * @param {boolean} isExtra 
 * @param {number} level 
 */
function addTotal(colIndex = 0, isRequired, isExtra, level = 0) {
    // Initial total index
    if (!totals[colIndex]) {
        totals[colIndex] = {
            count_required: isRequired ? (level ? 1 : 0) : 0,
            total_required: isRequired ? 1 : 0,
            count_extra: (!isRequired && isExtra) ? (level ? 1 : 0) : 0,
            total_extra: (!isRequired && isExtra) ? 1 : 0,
        }

        return;
    }

    if (isRequired) {
        totals[colIndex]['count_required'] += level ? 1 : 0;
        totals[colIndex]['total_required'] += 1;
    } else if (isExtra) {
        totals[colIndex]['count_extra'] += level ? 1 : 0;
        totals[colIndex]['total_extra'] += 1;
    };
}

function checkIsRequired(skill = {}, staffMajorId = 0) {
    return skill.major_id && skill.major_id.includes(String(staffMajorId));
}

function checkIsExtra(skill = {}, staffMajorId = 0) {
    let arrExtraMajor = Array.isArray(skill.extra_major) ? skill.extra_major :  (skill.extra_major ? skill.extra_major.split(",") : []);
    return arrExtraMajor.includes(String(staffMajorId));
}

/**
 * Convert number to Letter
 * 
 * @return string
 */
function numberToLetters(num) {
    let letters = '';
    while (num >= 0) {
        letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[num % 26] + letters;
        num = Math.floor(num / 26) - 1;
    }
    return letters;
}

function getStyleDefault(level = 0) {
    return {
        font: { bold: level ? true : false },
        alignment: { vertical: 'middle', horizontal: 'center', },
    };
}

function getStyleExtra(level = 0) {
    return {
        font: { bold: level ? true : false, color: { argb: '32CD32' } },
        alignment: { vertical: 'middle', horizontal: 'center', },
    }
}

function getStyleRequired(level = 0) {
    return {
        font: { bold: level ? true : false, color: { argb: 'FF0000' } },
        alignment: { vertical: 'middle', horizontal: 'center', },
    };
}

/**
 * Add styles
 * 
 * @returns 
 */
function getStyles() {
    return {
        row: {
            1: {
                width: 90,
                height: 30,
                font: { bold: true },
                alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
                border: {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
            },
            2: {
                width: 90,
                height: 70,
                font: { bold: true },
                alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
                border: {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
            },
            3: {
                font: { bold: true },
                alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
            },
            4: {
                font: { bold: true },
                alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
            },
        },
        col: {
            1: { width: 15 },
            2: {
                width: 60,
                alignment: { wrapText: true }
            },
            3: {
                width: 15,
                font: { bold: true },
                alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
            },
            4: {
                width: 15,
                font: { bold: true },
                alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
            },
        },
        cell: {}
    }
}
