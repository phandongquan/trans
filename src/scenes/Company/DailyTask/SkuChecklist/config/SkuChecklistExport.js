import dayjs from "dayjs";
import store from '~/redux/store';
import { timeFormatStandard } from "~/services/helper";
const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
const valids = { 0: "Không hợp lệ", 1: "Hợp lệ", 2: "Chưa đánh giá" };
const urlWorkTask = 'https://work.hasaki.vn/tasks?task_id='

export const header = {
    No: "STT",
    count: "Count",
    instock: "Instock",
    sku : 'SKU',
    date: "Date",
    count_date : 'Count Date',
    stock_id : 'Stock',
    created_by : 'Created By',
    createdby: "Created By ID",
    createdDate : 'Created Date',
    verifiedBy: "Verified By",
    verifiedDate : 'Verified Date',
    assign_locid : 'Assign location verify',
    updatedDate : 'Updated Date',
    status : 'Status' ,
    task_id : "Link task" , 

};

export function getHeader() {
    let result = [];
    Object.keys(header).map((key) => {
        result.push(header[key]);
    });
    return [result];
}
export function formatData(datas, stocks) {
    let { baseData: { locations } } = store.getState();
    let result = [];
    datas.map((record, index) => {
        let row = [];
        Object.keys(header).map((key) => {
            switch (key) {
                case 'No':
                    row.push(datas.indexOf(record) + 1)
                    break;
                case 'stock_id':
                    row.push(stocks.find((s) => s.id == record.stock_id)?.name)
                    break;
                case 'createdDate':
                    // row.push(timeFormatStandard(record.createdDate, dateTimeFormat, true))
                    row.push(dayjs(record.createdDate * 1000).format(dateTimeFormat))
                    break;
                case 'count_date':
                    row.push('')
                    break;
                case 'verifiedDate':
                    row.push(record.verifiedDate > 0 ? dayjs(record.verifiedDate * 1000).format(dateTimeFormat) : '')
                    break;
                case 'created_by':
                    row.push(record.created_by?.name)
                    break;
                case 'verifiedBy':
                    row.push(record.verify_by_staff?.staff_name)
                    break;
                case 'updatedDate':
                    row.push(record.updatedDate > 0 ? dayjs(record.updatedDate * 1000).format(dateTimeFormat) : '')
                    break;
                case 'status':
                    row.push(record.verifiedBy > 0 ?  valids[record.isCorrect] : 'Chưa đánh giá')
                    break;
                case 'task_id':
                    if (record.task_id) {
                        row.push(urlWorkTask + record.task_id)
                    }else{
                        row.push('')
                    }
                    break;
                case 'assign_locid':
                    let locFound = locations.find(l => l.id == record[key])
                    row.push(locFound?.name)
                    break;
                default:
                    row.push(record[key]);
                    break;
            }

      });
        result.push([...row]);

        if (record.count != 0 && record.data) {
            if (record.data.count_date.length) {
                (record.data.count_date).map(v =>{
                    let locFound = locations.find(l => l.id == record['assign_locid'])
                    result.push([
                        '',
                        v.count ? Number(v.count) : '',
                        '',
                        record['sku'],
                        '',
                        v.dateValue,
                        stocks.find((s) => s.id == record.stock_id)?.name,
                        record.created_by?.name,
                        record.createdby,
                        dayjs(record.createdDate * 1000).format(dateTimeFormat),
                        record.verify_by_staff?.staff_name,
                        record.verifiedDate > 0 ? dayjs(record.verifiedDate * 1000).format(dateTimeFormat) : '',
                        locFound ? locFound.name : '',
                        record.updatedDate > 0 ? dayjs(record.updatedDate * 1000).format(dateTimeFormat) : '',
                        record.verifiedBy > 0 ?  valids[record.isCorrect] : 'Chưa đánh giá',
                        record.task_id ? urlWorkTask + record.task_id  : ''
                    ])})
            }
        }
    });

    return result;
  }