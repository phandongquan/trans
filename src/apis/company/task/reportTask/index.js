import axios from '~/utils/request_hr';

const prefix = '/hr/projects';

export const getListReportTask = (params = {}) => {
  return axios({
      method: 'GET',
      params: {
          ...params
      },
      url: `${prefix}/task-report/location`
  })
}