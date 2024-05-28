
export const SEQUENCES_MONTHLY = 'monthly';
export const SEQUENCES_WEEKLY = 'weekly';
export const SEQUENCES_DAILY = 'daily';

export const colorScheduleStatus = { 0: "#f6993f",  1: "rgb(98,210,111)" };
export const scheduleStatus = { 0: 'Không hoạt động', 1: 'Kích hoạt' }

export const optionsSequences = [
    { label: 'Hàng tháng', value: SEQUENCES_MONTHLY },
    { label: 'Hàng tuần', value: SEQUENCES_WEEKLY },
    { label: 'Hàng ngày', value: SEQUENCES_DAILY },
];
export const optionsSequencesV2 = [
    { id: SEQUENCES_MONTHLY, name: 'Hàng tháng'},
    { id: SEQUENCES_WEEKLY , name: 'Hàng tuần'},
    {id: SEQUENCES_DAILY , name: 'Hàng ngày' },
];

export function getMonthOptions() {
    let monthOptions = [];
    for (let m = 1; m <= 12; m++) {
        monthOptions.push({ label: `Tháng ${m}`, value: m });
    };
    return monthOptions;
}

export function getDayOptions() {
    let dayOptions = [];
    for (let d = 1; d <= 31; d++) {
        dayOptions.push({ label: `Ngày ${d}`, value: d });
    };
    dayOptions.push({ label: `Ngày cuối cùng của tháng`, value: 0 });
    return dayOptions;
}

/**
 * Date of week, start with 0: Sunday
 * @returns 
 */
export function getDateOptions() {
    let dateOptions = [];
    for (let d = 0; d <= 6; d++) {
        dateOptions.push({ label: d == 0 ? 'Chủ nhật' : `Thứ ${d + 1}`, value: d });
    };
    return dateOptions;
}

export function getValuesFromArrayObj(arr = []) {
    return arr.reduce((acc, curr) => {
        acc.push(curr.value);
        return acc;
    }, []);
}

