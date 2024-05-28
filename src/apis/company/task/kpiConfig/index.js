import axios from "~/utils/request_hr";
const prefix = "/hr/kpi/configs";

export const getList = (params) => {
  return axios({
    method: "GET",
    params,
    url: `${prefix}`,
  });
};

export const insert = (data) => {
  return axios({
    method: "POST",
    data,
    url: `${prefix}`,
  });
};

export const detail = (id, params = {}) => {
  return axios({
    method: "GET",
    params,
    url: `${prefix}/${id}`,
  });
};

export const update = (id, data = {}) => {
  return axios({
    method: "PUT",
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

export const updateField = (data = {}) => {
  return axios({
    method: "POST",
    data,
    url: `${prefix}/update-field`,
  });
};

export default {
  getList,
  insert,
  detail,
  update,
  destroy,
  updateField,
};
