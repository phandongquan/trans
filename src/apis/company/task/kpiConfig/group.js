import axios from "~/utils/request_hr";
const prefix = "/hr/kpi/configs/group";

export const getList = (params) => {
  return axios({
    method: "GET",
    params,
    url: `${prefix}`,
  });
};

export const update = (id, data = {}) => {
  return axios({
    method: "POST",
    data,
    url: `${prefix}/${id}`,
  });
};

export const destroy = (id) => {
  return axios({
    method: "DELETE",
    url: `${prefix}/${id}`,
  });
};

export default {
  getList,
  update,
  destroy
};
