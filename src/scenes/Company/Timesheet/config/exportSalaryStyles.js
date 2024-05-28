export const styleFillRed = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0000' }
}
export const styleFillDarkYellow = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFF00' }
}

export const salaryStyles = {
    row: {
        2: { font: { bold: true } },
        3: { font: { bold: true }, horizontal: 'left' },
        4: {
            width: 70,
            font: { bold: true },
            // alignment: { vertical: 'top', horizontal: 'center', wrapText: true },
        }
    },
    col: {
        1: { width: 10, alignment: { horizontal: 'center' } },
        2: { width: 15, alignment: { horizontal: 'center' } },
        3: { width: 25 },
        4: { width: 15 },
        7: { width: 0 }, 8: { width: 0 },
        12: { width: 0 }, 13: { width: 0 }, 14: { width: 0 }, 15: { width: 0 }, 16: { width: 0 }, 17: { width: 0 }, 18: { width: 0 },
        25: { width: 0 }, 26: { width: 0 }, 27: { width: 0 }, 28: { width: 0 }, 28: { width: 0 }, 29: { width: 0 },
        36: { width: 0 },
    },
    cell: {
        'BA4': { font: { color: { argb: 'FF0000' }, bold: true } },
        'BB4': { font: { color: { argb: 'FF0000' }, bold: true } },
        'BC4': { font: { color: { argb: 'FF0000' }, bold: true } },
        'BD4': { font: { color: { argb: 'FF0000' }, bold: true } },
        'BE4': { font: { color: { argb: 'FF0000' }, bold: true } },
        'BF4': { font: { color: { argb: 'FF0000' }, bold: true } },
    }
}

export const summarySalaryStyles = {
    col: {
        1: { width: 8 },
        2: { width: 20 }, 3: { width: 10 }, 4: { width: 10 }, 5: { width: 3, horizontal: 'right' }, 6: { width: 9 },
        7: { alignment: { horizontal: 'center', wrapText: true } }, 8: { alignment: { horizontal: 'center', wrapText: true } }, 9: { alignment: { horizontal: 'center' } }, 10: { alignment: { horizontal: 'center', wrapText: true } },
    },
    row: {
        2: { font: { bold: true } },
        3: {
            width: 70,
            height: 60,
            font: { bold: true },
            alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        }
    },
    cell: {
        'V3': { font: { color: { argb: 'FF0000' }, bold: true } },
        'W3': { font: { color: { argb: 'FF0000' }, bold: true } },
        'X3': { font: { color: { argb: 'FF0000' }, bold: true } },
        'Y3': { fill: styleFillDarkYellow },
        'AA3': { font: { color: { argb: 'FF0000' }, bold: true } },
        'AB3': { font: { color: { argb: 'FF0000' }, bold: true } },
        'AE3': { font: { color: { argb: 'FF0000' }, bold: true } },

        'AX2': {
            font: { color: { argb: 'FF0000' }, bold: true },
            alignment: { vertical: 'middle', horizontal: 'center' }
        }
    }

}

export default {
    salaryStyles,
    summarySalaryStyles
};