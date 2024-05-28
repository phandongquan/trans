import { dateFormat } from '~/constants/basic';
import store from '~/redux/store';
import { timeFormatStandard, timeStartOfDay } from '~/services/helper';
import dayjs from 'dayjs'

const headerVertical = {
  date: "Ngày",
  step_id: "Step Id",
  step_name: "Step Name",
  staff_name: "Staff Name",
  code: "Staff Code",
  major_id: "Major",
  staff_loc_id: "Location",
  begintime: "Begin Time",
  is_valid: "Đánh giá",
  execution_time: "Giờ thực tế (phút)",
};

export function getHeaderVertical() {
  let headerFormat = [];
  Object.keys(headerVertical).map((h) => headerFormat.push(headerVertical[h]));
  return [headerFormat];
}

export function formatVertical(rows, steps) {
  let { baseData: { locations, majors } } = store.getState();
  let dataSource = [];
  let images = [];
  rows.map((row, locId) => {
      row.map(r => {
          if (r.logs) {
              r.logs.map(l => {
                  if (l.data?.images) {
                      let stepFind = steps.find(s => s.id == l.step_id)
                      let locFound = locations.find(l => l.id == r.staff_loc_id)
                      let majorFound = majors.find(m => m.id == r.major_id)
                      dataSource.push({
                          id: l.id,
                          date: timeFormatStandard(r.created_at, dateFormat),
                          step_id: l.step_id,
                          step_name: stepFind ? stepFind.name : '',
                          staff_name: r.staff_name,
                          code: r.code,
                          major_name: majorFound ? majorFound.name : '',
                          loc_name: locFound ? locFound.name : '',
                          begintime: stepFind ? stepFind.begintime : '',
                          is_valid: l.is_valid == 1 ? "Hợp lệ" : l.is_valid == 2 ? "Không hợp lệ" : "",
                          execution_time: l.execution_time ? l.execution_time*60 : ''
                      })
                  }
              })
          }
      })
  })

  dataSource = dataSource.sort(function(a, b) {
      return dayjs(a.date).format("X")  - dayjs(b.date).format("X");
  });

  let dataFormat = []
  dataSource.map((d, indexData) => {
      let imgs = [];

      if(Array.isArray(d.images)) {
          d.images.map((i, indexImage) => {
              imgs.push({
                  path: i,
                  tl: { col: 2, row: indexData + 1 },
                  br: { col: 3, row: indexData + 2 },
                  rowHeight: indexData + 2
              })
          })
      }
      
      dataFormat.push([
          d.date,
          d.step_id,
          d.step_name,
          d.staff_name,
          d.code, 
          d.major_name,
          d.loc_name,
          d.begintime,
          d.is_valid,
          d.execution_time
      ])

      images.push(imgs)
  })

  return {
      data: dataFormat,
      images: images
  } 
}
