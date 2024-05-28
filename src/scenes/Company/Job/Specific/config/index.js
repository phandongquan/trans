import { jobSpectific } from "~/constants/basic";

export const header = {
    'code': 'code',
    'content': 'content',
    'type': 'type',
    'status': 'status',
    'major_id': 'major_id',
    'answer_content': 'answer_content',
    'answer_is_correct': 'answer_is_correct',
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
            if (key == 'major_id') {
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
                d[key] = jobSpectific[key][d[key]]
            }

            if (key === 'type') {
                d[key] = jobSpectific[key][d[key]]
            }

            if (key === 'answer_is_correct') {
                d[key] = jobSpectific[key][d[key]]
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