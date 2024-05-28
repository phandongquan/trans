export const header = {
    'criteria_name': 'criteria_name',
    'major_id': 'major_id',
    'on_web': 'on_web',
    'status': 'status',
    'sub_criteria_name': 'sub_criteria_name',
    'point': 'point',
}

export function formatHeader() {
    let headers = []
    Object.keys(header).map((key, i) => {
        headers.push(header[key]);
    });
    return [headers];
}

export function formatData(datas, majors) {
    let result = [];
    datas.map(d => {
        let row = []
        Object.keys(header).map(key => {
            if (key === 'major_id') {
                const arr = d[key].split(',')
                let result = ""
                if (Array.isArray(arr) && arr.length) {
                    arr.map((majorId, index) => {
                        let majorFind = majors.find(m => m.id == majorId)
                        if (majorFind) {
                            result += `${index == 0 ? '' : ','} ${majorFind.name}`
                        }
                    })

                    d[key] = result
                }
            }

            if (key === 'status') {
                d[key] = d[key] == 1 ? 'Active' : 'Inactive'
            }

            if (key === 'on_web') {
                d[key] = d[key] == 1 ? 'Yes' : 'No'
            }

            row.push(d[key]);
        })
        result.push(row)
    })
    return result;
}

export default {
    header,
    formatHeader,
    formatData
}