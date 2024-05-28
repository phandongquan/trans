import axios from "~/utils/request_hr";

const prefix = "/hr/department-level";
export const list = (params = {}) => {
  return axios({
    method: "GET",
    params,
    url: `${prefix}`,
  });
};
export const create = (data = {}) => {
  return axios({
    method: "POST",
    data,
    url: `${prefix}/0`,
  });
};
export const update = (id = 0, data = {}) => {
  return axios({
    method: "POST",
    data,
    url: `${prefix}/${id}`,
  });
};
export const deleteLevel = (id, data) => {
  return axios({
    method: "DELETE",
    data,
    url: `${prefix}/` + id,
  });
};

