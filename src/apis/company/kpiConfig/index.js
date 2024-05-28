import axios from "~/utils/request_hr";
const prefix = "/hr/kpi/configs";

export const getList = (params) => {
  return axios({
    method: "GET",
    params,
    url: `${prefix}`,
  });
};

export default {
  getList
}