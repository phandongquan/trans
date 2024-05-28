import store from '~/redux/store';
export const header = {
    'name' : 'Name',
    'code' : 'Code',
    'email' : 'Email',
    'staff_loc_id' : 'Location',
    'division_id' : 'Division',
    'major_id' : 'Major',
    'staff_dept_id' : 'Department',
    'total_verify' : 'Total Verify',
    'total_kpi': 'Total KPI'
};
export function getHeaderStaff() {
    let result = [];
    Object.keys(header).map((key) => {
        result.push(header[key]);
    });
    return [result];
}

export function formatDataStaff(datas) {
    let { baseData: { locations, majors, divisions, departments } } = store.getState();
    let result = [];
    datas.map((record, index) => {
        let row = [];
        Object.keys(header).map((key) => {
            switch (key) {
                case "name":
                    row.push(record?.verify_user?.name);
                    break;
                case "code":
                    row.push(record?.verify_user?.staff?.code);
                    break;
                case "email":
                    row.push(record?.verify_user?.email);
                    break;
                case 'staff_dept_id':
                    row.push(departments.find(dept => record?.verify_user?.staff?.staff_dept_id == dept.id)?.name);
                    break;
                case 'major_id':
                    row.push(majors.find(m => record?.verify_user?.staff?.major_id == m.id)?.name);
                    break;
                case 'staff_loc_id':
                    row.push(locations.find(l => record?.verify_user?.staff?.staff_loc_id == l.id)?.name);
                    break;
                case 'division_id':
                    row.push(divisions.find(d => record?.verify_user?.staff?.division_id == d.id)?.name);
                    break;
                default:
                    row.push(record[key]);
                    break;
            }
      });
      result.push([...row]);
    });
    return result;
}
