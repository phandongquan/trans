import store from '~/redux/store';

export const header = {
    'value': 'Date / Time',
    'location_id': 'Location',
    'count': 'Count'
}

export function formatHeader() {
    let headers = [] 
    Object.keys(header).map((key, i) => {
        headers.push(header[key]);
    });
    return [headers];
}

export function formatData(datas, mode) {
    let { baseData: { locations } } = store.getState();
    let result = [];

    datas.map(d => {
        let row = []
        Object.keys(header).map(key => {
            switch(key) {
                case 'value':
                    if(mode == 'Day') {
                        row.push(`${d[key]}h - ${d[key] + 1}h `);
                        break;
                    }
                    row.push(d[key]);      
                    break;
                case 'location_id':
                    let locFound = locations.find(l => l.id == d[key])
                    row.push(locFound?.name)
                    break;
                default:
                    row.push(d[key]);
                    break;
            }
        })
        result.push(row)
    })

    return result;
}