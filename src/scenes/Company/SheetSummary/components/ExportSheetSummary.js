import React from 'react'
import { connect } from 'react-redux'

// Api
import { getList } from "~/apis/company/sheetSummary";
import { timeFormatStandard, showNotify, exportXlsWithStyle } from "~/services/helper";
import dayjs from "dayjs";

// Antd, Icons
import { Button } from 'antd'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport } from "@fortawesome/free-solid-svg-icons";

export const styleFillYellow = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF2CC' },
    border: {
        right: {
            style: 'thin'
        },
    }
}

export const styleFillPink = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: {
        argb: 'FFCCCC'
    }
}

export const ExportSheetSummary = (props) => {
    const { setLoading, getParams, loading, kpiGroups, groups,
        baseData: { departments, majors, locations, divisions } } = props;

    const styles = {
        row: {
            2: {
                height: 30,
            },
            3: {
                height: 30,
                font: {
                    bold: true
                },
                alignment: {
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: true
                },
                border: {
                    top: {
                        style: 'thin'
                    },
                    right: {
                        style: 'thin'
                    },
                    left: {
                        style: 'thin'
                    },
                    bottom: {
                        style: 'thin'
                    },
                }
            },
            4: {
                height: 5,
            },
            5: {
                height: 100,
                alignment: {
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: true
                },
                border: {
                    top: {
                        style: 'thin'
                    },
                    right: {
                        style: 'thin'
                    },
                    left: {
                        style: 'thin'
                    },
                    bottom: {
                        style: 'thin'
                    },
                }
            }
        },
        col: {
            1: { width: 15 },
            2: { width: 20 },
            3: { width: 20 },
            4: { width: 15 },
            5: { width: 25 },
        },
        cell: {
            'P5': { fill: styleFillYellow },
            'Q5': { fill: styleFillYellow },
            'R5': { fill: styleFillYellow },
            'S5': { fill: styleFillYellow },
            'T5': { fill: styleFillYellow },
            'U5': { fill: styleFillYellow },
            'V5': { fill: styleFillYellow },
            'W5': { fill: styleFillYellow },
            'X5': { fill: styleFillYellow },
            'Y5': { fill: styleFillYellow },
            'Z5': { fill: styleFillYellow },

            'AA5': { fill: styleFillPink },
            'AB5': { fill: styleFillPink },
            'AC5': { fill: styleFillPink },
            'AD5': { fill: styleFillPink },
            'AE5': { fill: styleFillPink },
            'AF5': { fill: styleFillPink },
        }
    }

    const headers = [
        {
            row2: 'Mã code',
            row5: 'Department',
            code: 'staff_dept_id'
        },
        {
            row5: 'Section',
            code: 'division_id'
        },
        {
            row5: 'Major',
            code: 'major_id'
        },
        {
            row5: 'Location',
            code: 'staff_loc_id'
        },
        {
            row5: 'Staff',
            code: 'staff_name'
        },
        {
            row5: 'Code',
            code: 'code'
        },
        {
            row5: 'Số tháng làm việc tại Hasaki',
            code: 'working_month'
        },
        {
            row4: 'Total (40) đến (49)',
            row5: 'Total Bonus (VND)',
            formula: ""
        },
        {
            row4: '(10)+(11)-(12)',
            row5: '% KPIs cuối cùng',
        },
        {
            row4: '(15) chia (14)',
            row5: '%KPIs thưởng',
        },
        {
            row5: '%KPIs bù',
        },
        {
            row4: 'Total (25) đến (30)',
            row5: '%KPIs trừ',
        },
        {
            row4: '(9) - 100% nếu lớn hơn 100%',
            row5: 'Vượt mức (%)',
        },
        {
            row4: '(32)*8',
            row5: 'Total Timing đến Công ty (giờ)'
        },
        {
            row4: 'Total (16) đến (24)',
            row5: 'Tổng thời gian KPIs (giờ)'
        },
        {
            row2: 'COS-KPI-008-T01',
            row3: 'Timing thưởng (Giờ)',
            row4: 'Total (49) đến (53)',
            row5: '3. Timing task (giờ)'
        },
        {
            row3: 'Timing thưởng (Giờ)',
            row4: 'Total (57) đến (59)',
            row5: '4. Timing Sale (giờ)'
        },
        {
            row3: 'Timing thưởng (Giờ)',
            row4: 'Total (62) đến (64)',
            row5: '5. Timing thanh toán (giờ)'
        },
        {
            row3: 'Timing thưởng (Giờ)',
            row4: 'Total (67) đến (77)',
            row5: '6. Timing đơn hàng online (giờ)'
        },
        {
            row3: 'Timing thưởng (Giờ)',
            row4: 'Total (81) đến (83)',
            row5: '7. Timing Re.PO (giờ)'
        },
        {
            row3: 'Timing thưởng (Giờ)',
            row4: 'Total (94)',
            row5: '8. Timing tạo phiếu IT tay (giờ)'
        },
        {
            row3: 'Timing thưởng (Giờ)',
            row4: 'Total (85) đến (88)',
            row5: '8. Timing Re.IT (giờ)'
        },
        {
            row3: 'Timing thưởng (Giờ)',
            row4: 'Total (85) đến (88)',
            row5: '8. Timing Re.IT (giờ)'
        },
        {
            row3: 'Timing thưởng (Giờ)',
            row4: 'Total (89) đến (93)',
            row5: '8. Timing Ex.IT (giờ)'
        },
        {
            row3: 'Timing thưởng (Giờ)',
            row4: 'Total (98)',
            row5: 'Timing KSHH (giờ)'
        },
        {
            row3: 'Timing thưởng (Giờ)',
            row4: 'Total (100) đến (102)',
            row5: 'Timing CSKH (giờ)'
        },
        {
            row3: 'Giảm trừ vi phạm (%)',
            row4: 'Total (54) đến (56)',
            row5: '3. KPIs trừ Task (%)'
        },
        {
            row3: 'Giảm trừ vi phạm (%)',
            row5: '5. KPIs trừ thanh toán (%)'
        },
        {
            row3: 'Giảm trừ vi phạm (%)',
            row5: '6. KPIs trừ đóng gói (%)'
        },
        {
            row3: 'Giảm trừ vi phạm (%)',
            row5: '7. KPIs trừ Re.PO (%)'
        },
        {
            row3: 'Giảm trừ vi phạm (%)',
            row5: '8. KPIs trừ Re.Ex.IT (%)'
        },
        {
            row3: 'Giảm trừ vi phạm (%)',
            row5: '10. KPIs trừ KN thái độ (%)'
        },
        {
            row3: '1. Thông tin ngày công, giờ làm việc',
            row5: 'Ngày công tính lương',
            code: 'working_day'
        },
        {
            row3: '1. Thông tin ngày công, giờ làm việc',
            row5: 'Ngày làm việc có điểm danh',
            code: 'days_work'
        },
        {
            row3: '1. Thông tin ngày công, giờ làm việc',
            row5: 'Nghỉ phép năm',
            code: 'days_off_a',
        },
        {
            row3: '1. Thông tin ngày công, giờ làm việc',
            row5: 'Nghỉ off tuần',
            code: 'days_off_w'
        },
        {
            row3: '1. Thông tin ngày công, giờ làm việc',
            row5: 'Nghỉ không lương',
            code: 'days_off_c'
        },
        {
            row3: '1. Thông tin ngày công, giờ làm việc',
            row5: 'Nghỉ chế độ',
            code: 'days_off_r'
        },
        {
            row3: '1. Thông tin ngày công, giờ làm việc',
            row5: 'Phép năm còn lại'
        },
        {
            row3: '1. Thông tin ngày công, giờ làm việc',
            row5: 'Nghỉ bù còn lại'
        },
        {
            row3: '1. Thông tin ngày công, giờ làm việc',
            row5: 'Total giờ Check out - Check in',
            code: 'working_time_company'
        },
    ]

    const formatDatas = (datas) => {
        let result = [];
        let r1 = [], r2 = [], r3 = [], r4 = [], r5 = [];
        headers.map((h, index) => {
            r1.push(index + 1)
            r2.push(h['row2'] || '');
            r3.push(h['row3'] || '');
            r4.push(h['row4'] || '');
            r5.push(h['row5'] || '');
        })

        let startIndex = headers.length;
        kpiGroups.map((k, index) => {
            r1.push(startIndex + index + 1)
            r2.push(k.code)
            r3.push(groups.find(g => k.group_id == g.id)?.name || '')
            r5.push(k.criterion)
        })

        datas.map(d => {
            let row = [];
            headers.map((h, index) => {
                switch (h['code']) {
                    case 'staff_dept_id':
                        row.push(d.staff?.staff_dept_id ? departments.find(dpt => dpt.id == d.staff?.staff_dept_id)?.name : '')
                        break;
                    case 'division_id':
                        row.push(d.staff?.division_id ? divisions.find(div => div.id == d.staff?.division_id)?.name : '')
                        break;
                    case 'major_id':
                        row.push(d.staff?.major_id ? majors.find(m => m.id == d.staff?.major_id)?.name : '')
                        break;
                    case 'staff_loc_id':
                        row.push(d.staff?.staff_loc_id ? locations.find(m => m.id == d.staff?.staff_loc_id)?.name : '')
                        break;
                    case 'staff_name':
                        row.push(d.staff?.staff_name || '')
                        break;
                    case 'code':
                        row.push(d.staff?.code || '')
                        break;
                    case 'working_month':
                        row.push(d.staff?.staff_hire_date ? dayjs().diff(dayjs(d.staff.staff_hire_date * 1000), 'months', true).toFixed(1) : '')
                        break;
                    default:
                        row.push(d[h['code']] || '');
                        break;
                }

                if (h.formula) {
                    row.push({ formula: h.formula });
                }
            })

            if (d.kpis) {
                kpiGroups.map(k => {
                    row.push(d.kpis[k.code]?.kpi || '');
                })
            }

            result.push(row)
        })
        return [r1, r2, r3, r4, r5, ...result];
    }

    const formatMerges = (datas) => {
        if (typeof datas[2] == 'undefined') {
            return [];
        }

        let tmp = '';
        let indexs = [];
        datas[2].map((d, index) => {
            if (tmp != d) {
                indexs.push(index)
            }
            tmp = d;
        })

        let merges = [];
        indexs.map((i, index) => {
            merges.push([3, i + 1, 3, indexs[index + 1]])
        })

        delete (merges[12]);
        return merges;
    }

    /**
     * Handle export sheet summary
     */
    const handleExport = () => {
        setLoading(true);
        let params = getParams();
        params = {
            ...params,
            limit: -1,
            offset: 0,
            month: params.month ? timeFormatStandard(params.month, "YYYY-MM") : null,
            is_admin: 1,
        };

        let xhr = getList(params);
        xhr.then(response => {
            if (response.status) {
                setLoading(false);
                let fileName = `Sheet-summary-${dayjs().format("YYYY-MM")}`;
                let datas = formatDatas(response.data.rows);
                let merges = formatMerges(datas);
                exportXlsWithStyle(fileName, datas, merges, [], styles);
            } else {
                showNotify('Notify', response.message, 'error')
            }
        })
    }

    return (
        <Button
            className="ml-1"
            loading={loading}
            key="export-staff"
            type="primary"
            icon={<FontAwesomeIcon icon={faFileExport} />}
            onClick={() => handleExport()}
        >
            &nbsp;Export V2
        </Button>
    )
}

const mapStateToProps = (state) => ({
    baseData: state.baseData,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ExportSheetSummary)