import dayjs from "dayjs";
import store from "~/redux/store";
import { statusTrainingPlanSkill } from "src/scenes/Company/TrainingPlan/config/index.js";

const header = {
  name: "Training plan",
  department_id: "Department",
  staff_name: "Staff",
  staff_code: "Staff code",
  staff_dept_id: "Department Staff",
  major_id: "Major",
  staff_loc_id: "Location",
  status: "Status",
  start_date: "Start date",
  end_date: "Deadline",
  ratio : 'Ratio Of Finished'
};

export function formatHeaderReport() {
  let headerFormat = [];
  Object.keys(header).map((key, i) => {
    headerFormat.push(header[key]);
  });
  return [headerFormat];
}

export function formatDataReport(datas) {
  let {
    baseData: { departments, majors, locations },
  } = store.getState();
  let result = [];
  datas.map((r, index) => {
    let rows = [];
    let checkExpirated = dayjs(r.deadline).unix() < dayjs().unix();
    Object.keys(header).map((key, indexKey) => {
      switch (key) {
        case "name":
          rows.push(r.name);
          break;
        case "department_id":
          if (r.department_id) {
            let DepartmentFound = departments.find(
              (p) => p.id == r.department_id
            );
            rows.push(DepartmentFound?.name || "");
          } else {
            rows.push("");
          }
          break;
        case "staff_name":
          rows.push(r.staff_name);
          break;
        case "staff_code":
          rows.push(r.code || "");
          break;
        case "staff_dept_id":
          if (r.staff_dept_id) {
            let StaffDepartmentFound = departments.find(
              (p) => p.id == r.staff_dept_id
            );
            rows.push(StaffDepartmentFound?.name || "");
          } else {
            rows.push("");
          }
          break;
        case "major_id":
          if (r.major_id) {
            let StaffMajorFound = majors.find((m) => m.id == r.major_id);
            rows.push(StaffMajorFound?.name || "");
          } else {
            rows.push("");
          }
          break;
        case "staff_loc_id":
          if (r.staff_loc_id) {
            let StaffLocationFound = locations.find(
              (l) => l.id == r.staff_loc_id
            );
            rows.push(StaffLocationFound?.name || "");
          } else {
            rows.push("");
          }
          break;
        case "status":
          rows.push(statusTrainingPlanSkill[checkExpirated ? 2 : r.status]);
          break;
        case "start_date":
          rows.push(r.start_date);
          break;
        case "end_date":
          rows.push(r.end_date);
          break;
        case 'ratio':
          rows.push(`${((Number(r.quantity_skill) / r.total_skill) * 100).toFixed(2)}%`);
          break;
        default:
          break;
      }
    });
    result.push(rows);
  });
  return result;
}
