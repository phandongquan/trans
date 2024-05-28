import dayjs from "dayjs";
import store from "~/redux/store";
import { uniq } from 'lodash'


const header = {
  location: "Location",
  po: "Count Of Purchase Order",
  total_label_code: "Count Of Label Code",
  total_qr: "Count Of QR Code",
  completion_rate: "Completion rate",
  none_asset: "QR Unlinked Devices"
};

export function formatHeader() {
  let headerFormat = [];
  Object.keys(header).map((key, i) => {
    headerFormat.push(header[key]);
  });
  return [headerFormat];
} 

export function formatData(datas) {
  let {
    baseData: { locations },
  } = store.getState();
  let result = [];
  if (!Array.isArray(datas)) {
    return [];
  }
  datas.map((r) => {
    let rows = [];
    Object.keys(header).map((key) => {
      switch (key) {
        case "location":
          if (r.location_id) {
            let LocationFound = locations.find((l) => l.id == r.location_id);
            rows.push(LocationFound?.name || "");
          } else {
            rows.push("");
          }
          break;
        case "po":
          let arrPo = String(r.po).split(",");
          rows.push(uniq(arrPo).length);
          break;
        case "total_label_code":
          rows.push(r.total_label_code);
          break;
        case "total_qr":
          rows.push(r.total_qr);
          break;
        case "completion_rate":
          rows.push(Number((r.total_qr * 100) / r.total_label_code).toFixed(1));
          break;
        case "none_asset":
          rows.push(r.none_asset);
          break;

        default:
          break;
      }
    });
    result.push(rows);
  });
  return result;
}

