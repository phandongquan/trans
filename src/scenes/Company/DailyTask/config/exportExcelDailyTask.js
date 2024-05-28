import { MEDIA_URL } from '~/constants'
import { Workbook } from 'exceljs';
import store from '~/redux/store';

const workbook = new Workbook();
const headerVertical = {
    step_id: 'Step Id',
    step_name: 'Step Name',
    images: 'Images',
    staff_name: 'Staff Name',
    code: 'Staff Code',
    major_id: 'Major',
    staff_loc_id: 'Location',
    begintime: 'Begin Time',
    is_valid: 'Đánh giá'
}

export function getHeaderDefault(rows, steps) {
    let { baseData: { locations, majors }} = store.getState();
    let merges = [
        [1,1,2,1],
        [1,2,2,2],
        [1,3,2,3]
    ]
    let header1 = [
        'Begin',
        'Name',
        'Repeat'
    ]

    let header2 = ['','',''];
    let count = 4;
    rows.map((row, locId) => {
        let locFound = locations.find(l => l.id == locId)
        row.map(r => {
            let majorFound = majors.find(m => m.id == r.major_id)
            header1.push(locFound ? locFound.name : '')
            header2.push(r.staff_name + ' (#' + r.code + ') ' + majorFound?.name)
        })
        if(row.length > 1) {
            merges.push([1, count, 1, count + row.length - 1])
        }
        count += row.length;
    })

    return {
        header: [...[header1], ...[header2]],
        merges
    }
}

export function getHeaderVertical() {
    let headerFormat = []
    Object.keys(headerVertical).map(h => headerFormat.push(headerVertical[h]))
    return [headerFormat];
}

export function getHeaderHorizontal() {
    return []
}

export function formatDefault(rows, steps) {
    let datas = []
    steps.map(step => {
        let dataByRow = [];
        dataByRow.push(step.begintime)
        dataByRow.push(step.name)
        dataByRow.push(step.repeat)

        rows.map(row => {
            row.map(r => {
                let logFind = r.logs.find(l => step.id == l.step_id)
                let note = '';
                if(logFind && typeof logFind.data?.note != 'undefined') {
                    note = '\n' +logFind.data.note
                }

                let status = '';
                if (logFind?.status == 0) {
                    status = 'WARNING'
                }
                if (step.action_id == 0 && logFind?.status == 1) {
                    status = 'FINISHED'
                }
                if (step.action_id == 1 && logFind?.status == 1 && typeof logFind?.data.images != 'undefined') {
                    status = 'DONE'
                }
                if (step.action_id == 1 && logFind?.status == 1 && typeof logFind?.data.images == 'undefined') {
                    status = 'SYSTEM ERROR'
                }

                dataByRow.push(status + note)
            })
        })

        datas.push(dataByRow)
    })

    return datas
}

export function formatVertical(rows, steps) {
    let { baseData: { locations, majors } } = store.getState();
    let dataSource = [];
    let images = [];
    rows.map((row, locId) => {
        row.map(r => {
            if (r.logs) {
                r.logs.map(l => {
                    if (l.data?.images) {
                        let stepFind = steps.find(s => s.id == l.step_id)
                        let locFound = locations.find(l => l.id == r.staff_loc_id)
                        let majorFound = majors.find(m => m.id == r.major_id)
                        dataSource.push({
                            id: l.id,
                            step_id: l.step_id,
                            step_name: stepFind ? stepFind.name : '',
                            images: l.data?.images_base64,
                            staff_name: r.staff_name,
                            code: r.code,
                            major_name: majorFound ? majorFound.name : '',
                            loc_name: locFound ? locFound.name : '',
                            begintime: stepFind ? stepFind.begintime : '',
                            is_valid: l.is_valid == 1 ? "Hợp lệ" : l.is_valid == 2 ? "Không hợp lệ" : ""
                        })
                    }
                })
            }
        })
    })

    dataSource = dataSource.sort(function(a, b) {
        return a.step_id - b.step_id;
    });

    let dataFormat = []
    dataSource.map((d, indexData) => {
        let imgs = [];

        if(Array.isArray(d.images)) {
            d.images.map((i, indexImage) => {
                imgs.push({
                    path: i,
                    tl: { col: 2, row: indexData + 1 },
                    br: { col: 3, row: indexData + 2 },
                    rowHeight: indexData + 2
                })
            })
        }

        
        dataFormat.push([
            d.step_id,
            d.step_name,
            '',
            d.staff_name,
            d.code, 
            d.major_name,
            d.loc_name,
            d.begintime,
            d.is_valid
        ])

        images.push(imgs)
    })

    return {
        data: dataFormat,
        images: images
    } 
}

export function formatHorizontal(rows, steps) {
    let { baseData: { majors, locations } } = store.getState();
    let headers = ['Name']
    let dataFomat = []
    let images = []
    steps.map((step, indexStep) => {
        dataFomat.push([step.name])
        let countImage = 1;
        rows.map(row => {
            row.map(r => {
                if (indexStep == 0) {
                    let majorFound = majors.find(m => m.id == r.major_id)
                    let locFound = locations.find(l => l.id == r.staff_loc_id)
                    headers.push(r.staff_name + ' (#' + r.code + ') (' + majorFound?.name + ' - ' + locFound?.name + ')')
                }
                let logFind = r.logs.find(l => l.step_id == step.id);
                if (logFind) {
                    let imageLogs = logFind.data?.images_base64 || [];
                    let imgs = []
                    imageLogs.map((i, indexImage) => {
                        imgs.push({
                            path: i,
                            tl: { col: countImage, row: indexStep + 1 },
                            br: { col: countImage + 1, row: indexStep + 2 },
                            rowHeight: indexStep + 2
                        })
                    })
                    images.push(imgs)
                }
                countImage += 1;
            })
        })
    })

    return {
        data: [...[headers], ...dataFomat],
        images: images
    }
}