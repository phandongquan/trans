import dayjs from 'dayjs';

export const header = {
    'counter': 'STT',
    'staff_code': 'Mã số',
    'staff_name': 'Họ và tên'
}

export function getHeader(state) {
    let row0 = ['DANH SÁCH PHÒNG BAN'];
    let row1 = [];
    let row2 = getHeaderRow2(state);
    let row3 = getHeaderRow3(state);

    return [...[row0], ...[row1], ...[row2],...[row3]]
}

export function getHeaderRow2 (state) {
    let result = [];
    Object.keys(header).map(key => {
        result.push(header[key])
    })

    result.push('')

    Object.keys(state.shiftKeys).map(key => {
        result.push(state.shiftKeys[key])
    })

    result.push('')

    let { totalDaysInMonthForm, month, year } = state;
    for(let i = 1; i <= totalDaysInMonthForm; i++)
        result.push(i)

    return result;
}

export function getHeaderRow3(state) {
    let result = [];
    let { totalDaysInMonthForm, month, year } = state;

    for(let i = 0; i <= 12; i++)
        result.push('');

    for(let i = 1; i <= totalDaysInMonthForm; i++)
        result.push(dayjs(year + '-' + month + '-' + i).format('dd'));
        
    return result;
}

export function formatData(state) {
    let result = [];
    let { staffSchedules, totalDaysInMonthForm, shiftKeys, valueShifts } = state;
    Object.keys(staffSchedules).map((staff_id, index) => {
        let item = staffSchedules[staff_id]
        let firstItemChild = item[Object.keys(item)[0]];
        let row = []

        row.push( String(index + 1))
        row.push( firstItemChild['code'] )
        row.push( firstItemChild['staff_name'] )
        row.push( '' )

        shiftKeys.map(shift => {
            row.push(typeof valueShifts[firstItemChild.staffsche_staff_id][shift] != 'undefined' ? valueShifts[firstItemChild.staffsche_staff_id][shift]: 0);
        })

        row.push( '' )   

        for(let i = 1; i <= totalDaysInMonthForm; i++){
            row.push(typeof item[i] != 'undefined' ? item[i].staffsche_shift : '')
        }
        result.push([...row])
    })
    return [...result];
} 

export default {
    getHeader,
    formatData
}