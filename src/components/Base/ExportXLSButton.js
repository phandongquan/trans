import React from 'react'
// import Button from 'react-bootstrap/Button';
import { Button } from 'antd';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { connect } from 'react-redux';

class ExportXLSButton extends React.Component {
    constructor(props) {
        super(props);
    }

    /**
     * Set column autofit header
     * @param {*} arrayOfArray 
     * @param {*} index 
     */
    autofitColumn(arrayOfArray, index = 0) {
        let wscols = [];
        for (var i = 0; i < arrayOfArray[index].length; i++) {  // columns length added
            wscols.push({ wch: typeof arrayOfArray[index][i].length != 'undefined' ? arrayOfArray[index][i].length + 5 : 7 })
        }

        return wscols;
    }

    /**
     * Export to xls
     */
    exportToXLS = () => {
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';


        let { dataPrepare, fileName, autofit, merges } = this.props;

        let xlsData = dataPrepare();
        let worksheet = XLSX.utils.aoa_to_sheet(xlsData, { skipHeader: true });
        worksheet['!cols'] = this.autofitColumn(xlsData, autofit);
        worksheet["!merges"] = typeof merges ? merges : null;

        let workbook = { Sheets: { 'List': worksheet }, SheetNames: ['List'] };
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        // Force download
        const data = new Blob([excelBuffer], { type: fileType });
        saveAs(data, fileName + fileExtension);
    }

    /**
     * 
     */
    render() {
        let extendProps = { ...this.props };
        delete extendProps['dataPrepare'];
        delete extendProps['autofit'];
        delete extendProps['fileName'];

        return (
            <Button className='btn_export' {...extendProps} onClick={() => this.exportToXLS()} >
                {this.props.children}
            </Button>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        ui: state.ui
    };
}
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(ExportXLSButton);