export const header = {
    'stt' : 'No.',
    'module' : 'Module',
    'key' : 'Key',
    'label_US' : 'Label US',
    'label_VN' : 'Label VN',
}

export function formatHeader() {
    let headers = [] 
    Object.keys(header).map((key, i) => {
        headers.push(header[key]);
    });
    return [headers];
}

export function formatData(datas , workflows) {
    let result = [];

    datas.map(d => {
        let row = []
        Object.keys(header).map(key => {
            switch(key) {
                case 'stt':
                    row.push((datas.indexOf(d) + 1).toString());
                    break;
                case 'label_US':
                    row.push(d['labels'][0]?.label);
                    break;
                case 'label_VN':
                    row.push(d['labels'][1]?.label);
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