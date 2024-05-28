import dayjs from 'dayjs';
import store from '~/redux/store';
const header = {
    stt: 'No.',
    address: 'Location',
    makh : 'Mã danh bộ',
}

export function formatHeader(arrTotalDays) {
    let headerFormat = [];
    Object.keys(header).map((key, i) => {
        headerFormat.push(header[key]); 
    });
    arrTotalDays.map(d => headerFormat.push(`Day ${d}`) )
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
                    const newAddress = record[key].split(',');
                    const province = newAddress[newAddress.length - 1];
                    const address = record.name + ' - ' + province;
                    row.push(address)
                    break;
                default :
                    row.push(record[key])
                    break;
            }
        })
        arrTotalDays.map((day, indexDay) => {
            row.push(record.records[indexDay] ? record.records[indexDay].total : ' ')
        })
        let newRow = row.slice(3)
        const totalSum = newRow.reduce((accumulator, currentValue ) =>  accumulator + currentValue ,0);
        row.push(totalSum)
        result.push(row)
    })
    return result;
}