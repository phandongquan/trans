import dayjs from "dayjs";
import store from "~/redux/store";
import { statusTrainingPlan, statusTrainingPlanSkill, subTypeRangeUsers } from "src/scenes/Company/TrainingPlan/config/index.js";

const header = {
  name: "Tittle",
  name_round: "Round Tittle",
  name_skill: "Skill Name",
  level: "Level",
  status: "Status",
  start_date: "Start date",
  end_date: "Deadline",
  sub_type: "Request Type",
  confirm_at: "Confirm",
  view_at:'Viewed',
  date_exam:"Examined",
  updated_by:"Updated By",
};

export function formatHeaderStaff() {
  let headerFormat = [];
  Object.keys(header).map((key, i) => {
    headerFormat.push(header[key]);
  });
  return [headerFormat];
}

export function formatDataStaff(datas) {
  let result = [];
  datas.map((r, index) => {
    let rows = [];
    Object.keys(header).map((key) => {
      switch (key) {
        case "name":
          rows.push(
            r.training_plan_detail_skill?.training_plan_detail?.training_plan
              .name
          );
          break;
        case "name_round":
          rows.push(r.training_plan_detail_skill?.training_plan_detail?.name);
          break;
        case "name_skill":
          rows.push(r.training_plan_detail_skill?.skill?.name);
          break;
        case "level":
          rows.push(r.level);
          break;
        case "status":
          rows.push(statusTrainingPlanSkill[r.status]);
          break;
        case "start_date":
          rows.push(r.start_date);
          break;
        case "end_date":
          rows.push(r.end_date);
          break;
        case "sub_type":
          rows.push(subTypeRangeUsers[r.training_plan_detail_skill?.sub_type]);
          break;
        case "confirm_at":
          rows.push(r.confirm_at);
          break;
        case "view_at":
          rows.push(r.view_at);
          break;
        case "date_exam":
          rows.push(
            r.training_plan_detail_skill?.training_plan_detail?.training_plan
              .date_exam
          );
          break;
        case "updated_by":
          rows.push(r.updated_by);
          break;
        default:
          break;
      }
    });
    result.push(rows);
  });
  return result;
}
