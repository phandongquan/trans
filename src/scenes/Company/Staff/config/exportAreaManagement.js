import dayjs from 'dayjs';
import store from "~/redux/store";
import { WorkType } from '~/constants/basic';

const header = {
  staff_name: "Staff Name",
  code: " Staff Code",
  staff_email: "Email",
  position_id: "Position",
  major_id: "Major",
  staff_dept_id: "Department",
  staff_loc_id: 'Location',
  manage_location: 'Manage Area'
};

export function formatHeaderReport() {
  let headerFormat = [];
  Object.keys(header).map((key, i) => {
    headerFormat.push(header[key]);
  });
  return [headerFormat];
}

export function formatDataAreaManagement(datas) {
  let {
    baseData: { departments, majors, locations, positions, divisions },
  } = store.getState();
  let result = [];
  datas.map((r, index) => {
    let rows = [];
    Object.keys(header).map((key) => {
      switch (key) {
        case "staff_name":
          rows.push(r.staff_name);
          break;
        case "code":
          rows.push(r.code);
          break;
        case "staff_email":
          rows.push(r.staff_email);
          break;
        case "position_id":
          if (r.position_id) {
            let StaffPositionFound = positions.find(
              (m) => m.id == r.position_id
            );
            rows.push(StaffPositionFound?.name || "");
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
        case "manage_location":
          if (r.manage_location?.locations) {
            let manageLocationIds = r?.manage_location?.locations;
            let manageLocationNames = [];
            manageLocationIds.forEach((manageLocationId) => {
              let manageLocationData = locations.find(
                (l) => manageLocationId == l.id
              );
              if (manageLocationData) {
                manageLocationNames.push(manageLocationData.name);
              }
            });
            rows.push(manageLocationNames.join(", "));
          } else {
            rows.push("");
          }
          break;
        default:
          break;
      }
    });
    result.push(rows);
  });
  return result;
}
