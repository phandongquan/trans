import store from '~/redux/store';

export const header = {
    id: 'ID',
    store_id: 'Store',
    cam : 'Camera',
    ctime_start: 'Time Start',
    ctime_end: 'Time End',
    order_id: 'Receipt',
    status: 'Status'
}
export function getHeader() {
    let result = [];
    Object.keys(header).map((key) => {
        result.push(header[key]);
    });
    return [result];
}

export function formatData(datas, typeStatus) {
    let result = [];
    let { baseData: { locations } } = store.getState();
    datas.map((record, index) => {
        let row = [];
        Object.keys(header).map((key) => {
            switch (key) {
                case "store_id":
                    let location = locations.find(l => record.store_id == l.id)
                    let locName = location ? location.name : 'NA';
                    row.push(locName);
                    break;
                case 'status':
                    row.push(typeof typeStatus[record.status] !== 'undefined' ? typeStatus[record.status] : '')
                    break;
                case 'cam' :
                    row.push(`Cam ${record.channel} - IP : ${record.ip} - Port :${record.port}`)
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