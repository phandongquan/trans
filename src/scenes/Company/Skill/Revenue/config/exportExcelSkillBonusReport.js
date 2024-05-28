import { dateFormat } from "~/constants/basic";
import { timeFormatStandard } from "~/services/helper";
import store from '~/redux/store';

export const header = {
	'code': 'Staff Code',
	'staff_name': 'Staff Name',
	'position_id': 'Position',
	'staff_dept_id': 'Department',
	'major_id': 'Major',
	'staff_loc_id': 'Location',
	'skill_id': 'Skill Id',
	'skill_code': 'Skill Code',
	'name': 'Skill Name',
	'lv': 'Level',
	'cost_bonus': 'Bonus (VND)',
	'date': 'Date'
}

export function getHeader() {
	let result = [];
	Object.keys(header).map(key => {
		result.push(header[key]);
	});
	return [result];
}

export function formatData(datas = []) {
	let { baseData: { departments, majors, positions, locations } } = store.getState();
	let result = [];
	datas.map(data => {
		let logs = JSON.parse(data.skill_revenue_logs);
		Object.keys(logs).map(skillId => {
			let row = [];
			let staffSkillLog = logs[skillId];
			Object.keys(header).map(key => {
				switch (key) {
					case "code":
						row.push(data[key]);
						break;
					case "staff_name":
						row.push(data[key]);
						break;
					case "position_id":
						row.push(positions.find((p) => p.id == data[key])?.name);
						break;
					case "staff_dept_id":
						row.push(departments.find((dept) => dept.id == data[key])?.name);
						break;
					case "major_id":
						row.push(majors.find((m) => m.id == data[key])?.name);
						break;
					case "staff_loc_id":
						row.push(locations.find((l) => l.id == data[key])?.name);
						break;
					case "skill_id":
						row.push(skillId);
						break;
					case "skill_code":
						row.push(staffSkillLog['code']);
						break;
					case "cost":
						row.push(Math.round(staffSkillLog[key]));
						break;
					case "date":
						row.push(timeFormatStandard(staffSkillLog[key], dateFormat));
						break;
					default:
						row.push(staffSkillLog[key]);
						break;
				}
			})
			result.push(row)
		})
	})

	return [...result];
}