import dayjs from "dayjs";
import { approvedStatus } from "~/constants/basic";
import store from "~/redux/store";
import {
  convertToSingleObject,
  parseBitwiseValues,
  parseIntegertoTime,
} from "~/services/helper";
import {
  dateTimeFormat,
  WorkType,
  leaveTypes,
  leaveTypeCustoms,
} from "~/constants/basic";
export const header = {
  counter: "STT",
  staff_code: "Staff Code",
  staff: "Staff Name",
  majorName: "Major",
  department: "Department",
  location_id: "Location",
  day: "Day",
  shift: "Shift",
  type: "Type",
  created_at: "Create at",
  status: "Status",
  appproved_time: "Approved Time",
  appprove_by: "Approve By",
  note: "Note",
};
export function formatHeaderHistory() {
  let format_header1 = [];

  Object.keys(header).map((key, i) => {
    format_header1.push(header[key]);
  });
  return {
    headers: [format_header1],
  };
}

export function formatData(staffList) {
  let { baseData } = store.getState();
  let { locations, departments, majors } = baseData;
  const types = { ...leaveTypeCustoms, ...leaveTypes };
  let result = [];

  staffList.map((staff, index) => {
    let row = [];
    Object.keys(header).map((key) => {
      switch (key) {
        case "counter":
          row.push(++index);
          break;
        case "staff_code":
          row.push(staff.staff_id);
          break;
        case "staff":
          let info = staff.staff_name;
          row.push(info);
          break;
        case "majorName":
          let majorName = "";
          majors.map((d) => {
            if (d.id == staff.major_id) {
              return (majorName = d.name);
            }
          });
          row.push(majorName);
          break;
        case "department":
          let departmentName = "";
          departments.map((d) => {
            if (d.id == staff.staff_dept_id) {
              return (departmentName = d.name);
            }
          });
          row.push(departmentName);
          break;
        case "location_id":
          let locationName = "";
          locations.map((d) => {
            if (d.id == staff.staff_loc_id) {
              return (locationName = d.name);
            }
          });
          row.push(locationName);
          break;
        case "shift":
          row.push(staff.leave_shift);
          break;
        case "day":
          row.push(staff.leave_from);
          break;
        case "type":
          let type = "";
          Object.keys(types).map((i) => {
            if (i == staff.leave_type && types[i]) {
              return (type = types[i]);
            }
          });
          row.push(type);
          break;
        case "appproved":
          let text = "";
          switch (staff.leave_approved) {
            case 0:
              text = "No Schedule";
              row.push(text);
              break;
            case 1:
              text = "Approved";
              row.push(text);
              break;
            case 2:
              text = "Reject";
              row.push(text);
              break;
            default:
              text = "No Schedule";
              row.push(text);
              break;
          }

          break;
        case "created_at":
          {
            row.push(
              staff.leave_created_at != "-0001-11-30 00:00:00"
                ? dayjs(staff.leave_created_at).format("YYYY-MM-DD HH:mm")
                : ""
            );
          }
          break;
        case "status":
           row.push(approvedStatus[staff.leave_approved] || '')           
          break;
        case "appproved_time":
          {
            if (staff.leave_approved_at !== null)
              row.push(
                staff.leave_approved_at != "-0001-11-30 00:00:00"
                  ? dayjs(staff.leave_approved_at).format("YYYY-MM-DD HH:mm")
                  : ""
              );
            else {
              row.push("");
            }
          }
          break;
        case "appprove_by":
          row.push(
            staff.leave_approved_by_user && staff.leave_approved_by_user.name
          );
          break;
        case "note":
          row.push(staff.leave_note);
          break;
        default:
          row.push(staff[key]);
          break;
      }
    });

    result.push([...row]);
  });
  return result;
}

export const stylesHistory = {
  row: {
    1: {
      width: 30,
      height: 20,
      font: { bold: true },
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
    },
  },
  col: {
    1: {
      width: 5,
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    },
    2: {
      width: 15,
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    },
    3: {
      width: 25,
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    },
    4: {
      width: 20,
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    },
    5: {
      width: 20,
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    },
    6: {
      width: 20,
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    },
    7: {
      width: 20,
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    },
    8: {
      width: 10,
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    },
    9: {
      width: 20,
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    },
    10: {
      width: 20,
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    },
    11: {
      width: 20,
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    },
    12: {
      width: 20,
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    },
    13: {
      width: 20,
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    },
    14: {
      width: 20,
      alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    },
  },
};
