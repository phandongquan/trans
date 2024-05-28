import dayjs from 'dayjs';
import store from '~/redux/store';

export const header = {
    stt: 'STT',
    staff_name : 'Staff name',
    email : 'Staff email',
    name : 'Name specialized',
    code : 'Code',
    place : 'Place',
    type : 'Type',
    date : 'Supply date' ,
    expire_date : 'Expire date',
    created_at : 'Created Date',
    verify_by : 'Verify by',
    verify_date : 'Verify date',
}

export function getHeader() {
    let result = [];
    Object.keys(header).map((key) => {
        result.push(header[key]);
    });
    return [result];
}
export function formatData(datas, types) {
    let result = [];
    let { baseData: { cities } } = store.getState();
    datas.map((record, index) => {
        let row = [];
        Object.keys(header).map((key) => {
            switch (key) {
                case "stt":
                    row.push(datas.indexOf(record) + 1)
                    break;
                case "staff_name":
                    if (record?.created_by_user) {
                        row.push(record.created_by_user?.name);
                    }
                    break;
                case "email":
                    if (record?.created_by_user) {
                        row.push(record.created_by_user?.email);
                    }
                    break;
                case "place":
                    row.push(record.place && cities[record.place] ? cities[record.place] : '');
                    break;
                case "type":
                    row.push(types[record.type]);
                    break;
                case 'created_at':
                    row.push(dayjs(record.created_at).format('YYYY-MM-DD'));
                    break;
                default:
                    row.push(record[key]);
                    break;
            }
        });
        result.push([...row]);
    });
    return result;
}