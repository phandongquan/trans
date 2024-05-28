import store from "~/redux/store";
import { typeFeedbacks, statusFeedbacks } from "./feedbackConfig";

export const header = {
  content: "Feedback",
  type: "Type",
  status: "Status",
  staff_dept_id: "Department",
  staff_name: "Staff Name",
  code: "Staff Code",
  created_at: 'Created At'
};

export function getHeader() {
  let result = [];
  Object.keys(header).map((key) => {
    result.push(header[key]);
  });
  return [result];
}

export function formatData(datas) {
  let {
    baseData: { departments },
  } = store.getState();
  let result = [];

  datas.map((record, index) => {
    let row = [];
    Object.keys(header).map((key) => {
      switch (key) {
        case "content":
          row.push(record.content);
          break;
        case "type":
          row.push(typeFeedbacks[record.type]);
          break;
        case "status":
          row.push(statusFeedbacks[record.status]);
          break;
        case "staff_dept_id":
          row.push(
            departments.find(
              (d) => d.id == record.created_by_staff?.staff_dept_id
            )?.name || ""
          );
          break;
        case "staff_name":
          row.push(record.created_by_staff?.staff_name || "");
          break;
        case "code":
          row.push(record.created_by_staff?.code || "");
          break;
        case "created_at":
          row.push(record.created_at);
          break;
        default:
          break;
      }
    });
    result.push([...row]);
  });

  return result;
}
