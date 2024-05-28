import dayjs from "dayjs";
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

export default class ExcelService {
    /**
     * @param {Workbook}
     */
    workbook = null;

    /**
    * @param {String}
    */
    activeSheetName = null;

    /**
     * @constructor Init workbook, attach worksheet for workbook, set default active sheet
     * 
     * @param {Array} sheetNames 
     */
    constructor(sheetNames = []) {
        this.workbook = new Workbook();
        this.addWorksheets(sheetNames);
        if (sheetNames && sheetNames.length) {
            this.setActiveSheet(sheetNames[0]);
        }
    }
    /**
     * Add worksheets for workbook
     * 
     * @param {Array} workSheets 
     * @return {this}
     */
    addWorksheets(worksheetNames = []) {
        worksheetNames.map(wsName => this.workbook.addWorksheet(wsName));
        return this;
    }

    /**
     * Set views for worksheet
     * 
     * @param {*} views 
     * @return {this}
     */
    setWorksheetViews(views = {}) {
        let worksheet = this.getActiveSheet();
        worksheet.views = [views];
        return this;
    }

    /**
     * Set active sheet working
     * 
     * @param {String} sheetName 
     * @return {this}
     */
    setActiveSheet(sheetName = '') {
        this.activeSheetName = sheetName;
        return this;
    }

    /**
     * Get worksheet activate
     * 
     * @returns {Workbook.WorkSheet}
     */
    getActiveSheet() {
        return this.workbook.getWorksheet(this.activeSheetName);;
    }

    /**
     * Add data for active worksheet
     * @param {Array} datas
     * 
     * @returns {this}
     */
    addWorksheetDatas(datas = []) {
        let worksheet = this.getActiveSheet();
        worksheet.addRows(datas);
        return this;
    }
    /**
     * Merge cell for active worksheet
     * @param {Array} merges
     * 
     * @returns {this}
     */
    mergeCells(merges = []) {
        let worksheet = this.getActiveSheet();
        // Add merges
        if (merges) {
            merges.map(m => worksheet.mergeCells(m))
        }
        return this;
    }

    /**
     * Add images for active worksheet
     * @param {Array} images
     * 
     * @returns {this}
     */
    addWorksheetImages(images = []) {
        // fetch sheet by name
        let worksheet = this.getActiveSheet();
        // Add images
        if (images) {
            images.map(image => {
                if (image.length) {
                    image.map(i => {
                        worksheet.addImage(this.workbook.addImage({
                            base64: i.path,
                            extension: 'png',
                        }), {
                            tl: i.tl,
                            br: i.br
                        });

                        worksheet.getRow(i.rowHeight).height = 90;
                    })
                }
            })
        }
        return this;
    }

    /**
     * Add styles for active worksheet
     * 
     * @param {Array} styles
     * 
     * @returns {this}
     */
    addWorksheetStyles(styles = []) {
        let worksheet = this.getActiveSheet();
        if (styles) {

            if (typeof styles.col != 'undefined') {
                Object.keys(styles.col).map(colIndex => {
                    Object.keys(styles.col[colIndex]).map(key => {
                        worksheet.getColumn(Number(colIndex))[key] = styles.col[colIndex][key];
                    })
                })
            }
            if (typeof styles.row != 'undefined') {
                Object.keys(styles.row).map(rowIndex => {
                    Object.keys(styles.row[rowIndex]).map(key => {
                        worksheet.getRow(rowIndex)[key] = styles.row[rowIndex][key];
                    })
                })
            }

            if (typeof styles.cell != 'undefined') {
                Object.keys(styles.cell).map(cellIndex => {
                    Object.keys(styles.cell[cellIndex]).map(key => {
                        worksheet.getCell(cellIndex)[key] = styles.cell[cellIndex][key];
                    })
                })
            }
        }
        return this;
    }
    // add color row base on value in index column
    addColorRow(index, bgColor, textColor) {
        let worksheet = this.getActiveSheet();
        worksheet.eachRow((row) => {
            if (row.values[index] == '') {
                row.eachCell((cell, cellNumber) => {
                    if (cellNumber >= index) {
                        row.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: bgColor },
                        };
                        row.font = { bold: true, color: { argb: textColor } };
                    }
                });
            }
        });
        return this;
    }
    // add color for cell if cell value is Pending just that field 
    addColorCell(index, bgColor, textColor) {
        let worksheet = this.getActiveSheet();
        worksheet.eachRow((row) => {
            if (row.values[index] == 'Pending') {
                row.eachCell((cell, cellNumber) => {
                    if (cellNumber == index) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: bgColor },
                        };
                        cell.font = { bold: true, color: { argb: textColor } };
                    }
                });
            }
        });
        return this;
    }
    addAllCellBorders(borderType, borderColor) {
        let worksheet = this.getActiveSheet();
        worksheet.eachRow((row) => {
                row.border = {
                        top: { style: borderType, color: { argb: borderColor } },
                        left: { style: borderType, color: { argb: borderColor } },
                        bottom: { style: borderType, color: { argb: borderColor } },
                        right: { style: borderType, color: { argb: borderColor } },
                    };
                // }
        });
        return this;
    }
    // check character value > 7 set fill color for that row
    addColorGreenRow(index, bgColor, textColor) {
        let worksheet = this.getActiveSheet();
        worksheet.eachRow((row) => {
            if (row.values[index] && row.values[index].length == 7 || this.checkSkillGroup(row.values[index])) {
                row.eachCell((cell, cellNumber) => {
                    if (cellNumber >= index) {
                        row.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: bgColor },
                        };
                        row.font = { bold: true, color: { argb: textColor } };
                    }
                });
            }
        });
        return this;
    }

    /**
     * Check is skill group
     * @param {*} code 
     */
    checkSkillGroup(code) {
        if(!code || !(typeof code === 'string' || code instanceof String)) {
            return false;
        }
        let arrSplitted = code.split("-");
        return (arrSplitted.length == 3 && isNaN(arrSplitted[1]));
    }


    /**
     * Force download xlsx
     * 
     * @param {*} fileName 
     */
    forceDownload(fileName, type = '') {
        this.workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer], { type: type ? type : 'application/octet-stream' }), fileName + `.xlsx`);
        });
    }
}


