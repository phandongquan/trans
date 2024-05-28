import store from '~/redux/store';

/**
 * Header
 */
export const header = {
    'skill_code': 'Skill Code',
    'skill_name': 'Skill',
    'staff_code': 'Staff Code',
    'staff_name': 'Staff',
    'staff_loc_id': 'Location',
    'position_id': 'Position',
    'major_id': 'Major',
    'old_level': 'Old Level',
    'new_level': 'New Level',
    'created_at': 'Date',
    'created_by': 'Approved By',
    'bonus_change': 'Bonus Change',
}

/**
 * Format headers
 * @returns 
 */
export function formatHeader() {
    let headers = []
    Object.keys(header).map((key, i) => {
        headers.push(header[key]);
    });
    return [headers];
}

/**
 * Format data from header
 * @param {Array} staffSkillLogs 
 */
 export function formatData(staffSkillLogs) {
    let { baseData: { positions, majors, locations } } = store.getState();
    let data = [];
    staffSkillLogs.map(skl => {
        let exportData = [];
        Object.keys(header).map(key => {
                switch (key) {
                    case 'skill_code':
                        exportData.push(skl.skill?.code || '');
                        break;
                    case 'skill_name':
                        exportData.push(skl.skill?.name || '');
                        break;
                    case 'staff_code':
                        exportData.push(skl.staff?.code || '');
                        break;
                    case 'staff_name':
                        exportData.push(skl.staff?.staff_name || '');
                        break;
                    case 'staff_loc_id':
                        if (skl.staff) {
                            let locFound = locations.find(l => l.id == skl.staff.staff_loc_id)
                            exportData.push(locFound?.name || '');
                        } else {
                            exportData.push('');
                        }
                        break;
                    case 'position_id': 
                        if(skl.staff) {
                            let positionFound = positions.find(p => p.id == skl.staff.position_id)
                            exportData.push(positionFound?.name || '');
                        } else {
                            exportData.push('');
                        }
                        break;
                    case 'major_id':
                        if (skl.staff) {
                            let majorFound = majors.find(m => m.id == skl.staff.major_id)
                            exportData.push(majorFound?.name || '');
                        } else {
                            exportData.push('');
                        }
                        break;
                    case 'created_by':
                        exportData.push(skl.user?.name || '');
                        break;
                    case 'bonus_change':
                        let result = 0;

                        // Down skill
                        if(skl.old_level == 1 && skl.new_level == 0) result = -skl.skill?.cost
                        if(skl.old_level == 2 && skl.new_level == 0) result = -(skl.skill?.cost + skl.skill?.cost*0.1)
                        if(skl.old_level == 2 && skl.new_level == 1) result = -skl.skill?.cost*0.1

                        // Up skill
                        if(skl.old_level == 0 && skl.new_level == 1) result = skl.skill?.cost
                        if(skl.old_level == 0 && skl.new_level == 2) result = skl.skill?.cost + skl.skill?.cost*0.1
                        if(skl.old_level == 1 && skl.new_level == 2) result = skl.skill?.cost*0.1

                        if(result && result != 0.000 && result != 0.00) {
                            exportData.push(Math.round(result))
                        } else {
                            exportData.push('')
                        }
                        break;
                    default:
                        exportData.push(skl[key]);
                        break;
                }
        });
        data.push(exportData);
    });
    return data;
}