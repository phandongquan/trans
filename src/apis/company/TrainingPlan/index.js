import axios from "~/utils/request_hr";
import formData from "~/utils/formData_hr";

const prefix = "/hr/training-plan";

export const insert = (data) => {
  return axios({
    method: "POST",
    data,
    url: `${prefix}`,
  });
};

export const getList = (params = {}) => {
  return axios({
    method: "GET",
    params: {
      ...params,
    },
    url: `${prefix}`,
  });
};

export const getListStaff = (params = {}) => {
  return axios({
      method: 'GET',
      params: {
          ...params
      },
      url: `${prefix}/staff`
  })
}
export const getListReport = (params = {}) => {
  return axios({
      method: 'GET',
      params: {
          ...params
      },
      url: `${prefix}/report`
  })
}
export const deleteTrainingPlan = (id) => {
  return axios({
    method: "DELETE",
    url: `${prefix}/${id}`,
  });
};

export const updateTrainingPlan = (id, data) => {
  return axios({
    method: "PUT",
    data,
    url: `${prefix}/${id}`,
  });
};

export const copyTrainingPlan = (id) => {
  return axios({
      method: 'POST',
      url: `${prefix}/dup/${id}`
  })
}

export const detailPlan = (id, params = {}) => {
  return axios({
    method: "GET",
    params,
    url: `${prefix}/${id}`,
  });
};
export const detailChild = (id) =>{
  return axios({
    method: "GET",
    url: `${prefix}/detail/${id}`,
  });
}
export const updateDetailChild = (id , data) =>{
  return axios({
    method: "PUT",
    data,
    url: `${prefix}/detail/${id}`,
  });
}
export const getReportChart= (params = {}) =>{
  return axios({
    method: "GET",
    params: {
      ...params,
    },
    url: `${prefix}/report/chart`,
  });
}

export default {
  insert,
  getList,
  deleteTrainingPlan,
  updateTrainingPlan,
  detailPlan,
  getListStaff,
  getListReport,
  getReportChart,
  copyTrainingPlan,
};
