import axios from "~/utils/request";
import axios_hr from "~/utils/request_hr";
import formData_hr from "~/utils/formData_hr";
const prefix = "/hr/staff-schedule";

export const getList = (params = {}) => {
  return axios_hr({
    method: "GET",
    params: {
      ...params,
    },
    url: `${prefix}`,
  });
};

export const preImport = (data) => {
  return formData_hr({
    method: "POST",
    data,
    url: `${prefix}/pre-import`,
  });
};

export const create = (data) => {
  return axios_hr({
    method: "POST",
    data,
    url: `${prefix}`,
  });
};

export const detail = (id, params) => {
  return axios_hr({
    method: "GET",
    params: {
      ...params,
    },
    url: `${prefix}/` + id,
  });
};

export const update = (id, data) => {
  return axios_hr({
    method: "PUT",
    data,
    url: `${prefix}/` + id,
  });
};

export const deleteStaffSchedule = (id) => {
  return axios_hr({
    method: "DELETE",
    url: `${prefix}/` + id,
  });
};

export const uploadTemplate = (data) => {
  return formData_hr({
    method: "POST",
    data,
    url: `${prefix}/up-temp`,
  });
};

export const downloadTemplate = () => {
  return axios_hr({
    method: "GET",
    url: `${prefix}/down-temp`,
  });
};
export const getListDataDashboard = (params = {}) => {
  return axios_hr({
    method: "GET",
    params: {
      ...params,
    },
    url: `${prefix}/dashboard`,
  });
};
export const getDetailDataDashboard = (params = {}) => {
  return axios_hr({
    method: "GET",
    params: {
      ...params,
    },
    url: `${prefix}/dashboard/detail`,
  });
}
export default {
  getList,
  getListDataDashboard,
  create,
};
