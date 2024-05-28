import dayjs from "dayjs";
import {
  genders,
  religions,
  certificates,
  taskStatus,
} from "~/constants/basic";
import store from "~/redux/store";
import {
  convertToSingleObject,
  parseBitwiseValues,
  parseIntegertoTime,
} from "~/services/helper";

const dateFormat = "YYYY-MM-DD";

/**
 * XLS file header
 */
export const header = {
  group_name: "Phân nhóm",
  department_id: "Dept",
  major_id: "Major",
  sub_major_id: "Sub Major",
  code: "Mã công việc",
  name: "chi tiết công việc",
  planned_hours: "thời gian dự kiến",
  cost: "chi phí",
};
/**
 * Format data from header
 * @param {Array} taskList
 */
export function formatTask(taskList) {
  let {
    baseData: { departments, majors },
  } = store.getState();
  let data = [];
  taskList.map((task, i) => {
    let exportData = [];
    Object.keys(header).map((key) => {
      switch (key) {
        // case 'counter':
        //     exportData.push(++i);
        //     break;
        case "major_id":
          if (task.major_id > 0) {
            return exportData.push(
              majors.find((m) => m.id == task.major_id)?.name
            );
          } else {
            return exportData.push("");
          }

        case "sub_major_id":
          if (task.major_id == 0) {
            return exportData.push(
              majors.find((m) => m.id == task.sub_major_id)?.name
            );
          } else {
            return exportData.push("");
          }
        //exportData.push(majors.find((m) => m.id == task.major_id)?.name);
        case "department_id":
          exportData.push(
            departments.find((d) => d.id == task.department_id)?.name
          );
          break;
        default:
          exportData.push(task[key]);
      }
    });
    data.push(exportData);
  });
  return data;
}
export default {
  header,
  formatTask,
};
