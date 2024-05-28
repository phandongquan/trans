import dayjs from 'dayjs';
import store from '~/redux/store';
const arrMonth = [1 , 2, 3, 4, 5, 6, 7, 8, 9, 10 ,11 ,12] // 12 tháng
const header = {
    stt: 'No.',
    address: 'Location',
    makh : 'Mã danh bộ	',
}

export function formatHeader() {
    let headerFormat = [];
    Object.keys(header).map((key, i) => {
        headerFormat.push(header[key]); 
    });
    arrMonth.map((month, i) => headerFormat.push(month))
    headerFormat.push('Sum')
    return [headerFormat];
}
export function formatData(datas , arrTotalDays) {
    let { baseData : { locations } } = store.getState();
    let result = [];
    datas.map((record, index) => {
        let row = []
        Object.keys(header).map((key ,indexKey) => {
            switch (key) {
                case 'stt':
                    row.push(datas.indexOf(record) + 1);
                    break;
                case 'address':
                    if (record[key] == null) {
                        row.push('');
                    } else {
                        const newAddress = record[key].split(',');
                        const province = newAddress[newAddress.length - 1];
                        const address = record.name + ' - ' + province;
                        row.push(address);
                    }
                    break;
                default :
                    row.push(record[key])
                    break;
            }
        })
        arrMonth.map((month, indexMonth) => {
            row.push(record.records[indexMonth] ? record.records[indexMonth].total : ' ')
        })
        let newRow = row.slice(3)
        const totalSum = newRow.reduce((accumulator, currentValue ) =>  accumulator + currentValue ,0);
        row.push(totalSum)
        result.push(row)
    })
    return result;
}