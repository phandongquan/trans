import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Form, Row, Col, DatePicker, Select, Spin, Tabs, Table, Image as ImageAnt, Button } from 'antd'
import { PageHeader } from '@ant-design/pro-layout';
import { dateFormat, scheduleList } from '~/constants/basic'
import { getVerticalColumnReport, searchForDropDownTask, updateValid } from '~/apis/company/dailyTask'
import dayjs from 'dayjs'
import { timeFormatStandard, getThumbnailHR, getURLHR, showNotify, checkPermission, convertToFormData } from '~/services/helper'
import './config/dailyTask.css'
import { uniqueId } from 'lodash'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { formatDefault, formatVertical, formatHorizontal, getHeaderDefault, getHeaderVertical, getHeaderHorizontal } from './config/exportExcelDailyTask';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

import Tab from '~/components/Base/Tab';
import tabList from './config/tabList'
import { getList as apiGetListTask } from '~/apis/company/task'
import { exportBackground } from '~/apis/excelIOLogs/index';
import Dropdown from '~/components/Base/Dropdown'

import Lightbox from "rhino-react-image-lightbox-rotate";
import StaffDropdown from '~/components/Base/StaffDropdown'

import LazyLoad from 'react-lazy-load'
import { screenResponsive, EXCEL_IO_TYPE_OUTPUT_DAILY_TASK_VERTICAL_REPORT } from '~/constants/basic';
const optionDefault = 1;
const optionVertical = 2;
const optionHorizontal = 3;

const { Option, OptGroup } = Select;
export class DailyTask extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef()
        this.state = {
            loading: false,
            rows: [],
            steps: [],
            option: optionDefault,
            listTasks: [],
            dataSourceVertical: [],

            dataSourceHorizontal: [],
            headerHorizontal: [],

            photoIndex: 0,
            toggler: false,
            dataLighBoxHorizontal: [],
            dataLighBoxVertical: [],
            datasVerify: [],
            dataVerify: {},
            visible: false , 
            page: 1,
            total : 0,
            typeSchedule : null
        }
    }

    componentDidMount() {
        this.formRef.current.setFieldsValue({
            date: dayjs(),
            task_id: "56",
        })

        let params = this.formRef.current.getFieldsValue();
        this.getDatas(params);

        this.getListTasks();
    }
    
    /**
     * 
     * @param {*} prevProps 
     * @param {*} prevState 
     */
    componentDidUpdate(prevProps, prevState) {
        // if (prevState.option != this.state.option) {
        //     this.setState({page : 1} , () => this.getListTasks())
        // }

        if (prevState.option != this.state.option && this.state.option == optionVertical) {
            this.setDataSourceVertical(this.state.rows, this.state.steps);
        }
        if (prevState.option != this.state.option && this.state.option == optionHorizontal) {
            this.setDataSourceHorizontal(this.state.rows, this.state.steps);
        }
    }

    /**
     * Get list tasks
     */
    getListTasks = async () => {
        let response = await apiGetListTask({ limit: -1, offset: 0 })
        if (response.status) {
            this.setState({ listTasks: response.data.rows })
        }
    }

    /**
     * Get datas
     */
    getDatas = async (params = {}) => {
        this.setState({ loading: true })
        if(this.state.typeSchedule < 2 ){ // schedule default and schedule daily
            if (params.date) {
                params.from_date = timeFormatStandard(params.date, dateFormat);
                params.to_date = timeFormatStandard(params.date, dateFormat);
                delete (params.date)
            }
        }else{
            if(this.state.typeSchedule == 2 && params.dateWeek ) {// schedule Weekly
                params.from_date = dayjs(params.dateWeek).startOf('week').format(dateFormat)
                params.to_date = dayjs(params.dateWeek).endOf('week').format(dateFormat)
                delete (params.dateWeek)
            }
            if(this.state.typeSchedule == 3 && params.dateMonth ) {// schedule monthly
                params.from_date = timeFormatStandard(params.dateMonth[0], dateFormat);
                params.to_date = timeFormatStandard(params.dateMonth[1], dateFormat);
                delete (params.dateMonth)
            }
        }
        let response = await getVerticalColumnReport(params)
        if(response.status){
            let { rows, steps } = response.data;
            let result = []
            rows.map(r => {
                if (typeof result[r.staff_loc_id] == 'undefined') {
                    result[r.staff_loc_id] = [r]
                } else {
                    result[r.staff_loc_id] = [...result[r.staff_loc_id], r]
                }
            })
            if(this.state.option == optionVertical) {
                this.setDataSourceVertical(result, steps);
            }
            if(this.state.option == optionHorizontal) {
                this.setDataSourceHorizontal(result, steps);
            }
    
            this.setState({ loading: false, rows: result, steps })
        }
    }

    /**
     * Set data source vertical
     */
    setDataSourceVertical = (rows, steps) => {
        let dataSource = []
        rows.map((row, locId) => {
            row.map(r => {
                if (r.logs) {
                    r.logs.map(l => {
                        if (Array.isArray( l.data?.images) &&  (l.data?.images).length) {
                            let stepFind = steps.find(s => s.id == l.step_id)
                            dataSource.push({
                                id: l.id,
                                step_id: l.step_id,
                                step_name: stepFind ? stepFind.name : '',
                                images: l.data?.images ? l.data.images : [],
                                staff_name: r.staff_name,
                                staff_loc_id: r.staff_loc_id,
                                begintime: stepFind ? stepFind.begintime : '',
                                major_id: r.major_id,
                                code: r.code,
                                image_default: stepFind && stepFind.images ? JSON.parse(stepFind.images) : [],
                                is_valid: l.is_valid,
                                updated_at: l.updated_at,
                                note: l.data?.note
                            })
                        }
                    })
                }
            })
        })

        dataSource = dataSource.sort(function (a, b) {
            return a.step_id - b.step_id;
        });

        let dataLighBoxVertical = [];
        dataSource.map(d => {
            if (d.images) {
                d.images.map(img => dataLighBoxVertical.push(getURLHR(img)))
            }
        })

        this.setState({ dataSourceVertical: dataSource, dataLighBoxVertical })
    }

    /**
     * Set data source Horizontal
     */
    setDataSourceHorizontal = (rows, steps) => {
        let { baseData: { majors, locations } } = this.props

        let dataSource = [];
        let dataLighBoxHorizontal = [];
        let headers = []
        steps.map((step, indexStep) => {
            let image_default = step.images ? JSON.parse(step.images) : []
            let dataByStep = [step.name];
            let resultImgDef = [];
            image_default.map(i => resultImgDef.push(<div className='mr-1' key={uniqueId('img')}>
                <ImageAnt style={{ objectFit: 'cover', marginRight: 2 }} preview={{ src: getURLHR(i) }} src={getThumbnailHR(i, '100x70')} />
            </div>))
            dataByStep.push(<div style={{ display: 'flex', justifyContent: 'center' }}>{resultImgDef}</div>)

            rows.map(row => {
                row.map(r => {
                    if (indexStep == 0) {
                        let majorFound = majors.find(m => m.id == r.major_id)
                        let locFound = locations.find(l => l.id == r.staff_loc_id)
                        headers.push({
                            staff_name: r.staff_name,
                            code: r.code,
                            major_name: majorFound ? majorFound.name : '',
                            loc_name: locFound ? locFound.name : ''
                        })
                    }
                    let logFind = r.logs.find(l => l.step_id == step.id);
                    if (logFind) {
                        let imageLogs = logFind.data?.images || [];
                        let imgs = []
                        imageLogs.map((i) => {
                            dataLighBoxHorizontal.push(getURLHR(i))
                            let index = dataLighBoxHorizontal.findIndex(a => a == getURLHR(i))
                            return imgs.push(
                            <LazyLoad>
                                <img
                                    onClick={() =>
                                        this.setState({
                                            toggler: true,
                                            photoIndex: index,
                                        })
                                    }
                                    className="mr-2 cursor-pointer"
                                    key={uniqueId("img_")}
                                    style={{ objectFit: "cover" }}
                                        src={getThumbnailHR(i, '100x70')}
                                />
                                </LazyLoad>
                            );
                        })
                        dataByStep.push(<div style={{ display: 'flex', justifyContent: 'center' }}>{imgs}</div>)
                    } else {
                        dataByStep.push('')
                    }
                })
            })
            dataSource.push(dataByStep)
        })

        this.setState({ dataSourceHorizontal: dataSource, headerHorizontal: headers, dataLighBoxHorizontal })
    }

    submitForm = () => {
        this.formRef.current
            .validateFields()
            .then((values) => {
                this.getDatas(values);
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    }

    /**
     * Export data
     */
    exportData = () => {
        let params = this.formRef.current.getFieldsValue();
        this.setState({ loading: true })
        if (params.date) {
            params.from_date = timeFormatStandard(params.date, dateFormat);
            params.to_date = timeFormatStandard(params.date, dateFormat);
            delete (params.date)
        }

        params.is_export = 1;
        let xhr = getVerticalColumnReport(params)
        xhr.then(response => {
            if (response.status) {
                let resultRows = [];
                let { rows, steps } = response.data;
                rows.map(r => {
                    if (typeof resultRows[r.staff_loc_id] == 'undefined') {
                        resultRows[r.staff_loc_id] = [r]
                    } else {
                        resultRows[r.staff_loc_id] = [...resultRows[r.staff_loc_id], r]
                    }
                })

                let { option } = this.state;
                let headerFormat = [];
                let dataFormat = [];
                let fileName = '';
                let merges = [];
                let images = [];
                if (option == optionDefault) {
                    fileName = 'Bao-cao-cong-viec-hang-ngay'
                    let result = getHeaderDefault(resultRows, steps)
                    headerFormat = result.header
                    merges = result.merges
                    dataFormat = formatDefault(resultRows, steps)
                } else if (option == optionVertical) {
                    fileName = 'Bao-cao-cong-viec-hang-ngay-cot-doc'
                    headerFormat = getHeaderVertical()
                    let result = formatVertical(resultRows, steps)
                    images = result.images
                    dataFormat = result.data
                } else {
                    fileName = 'Bao-cao-cong-viec-hang-ngay-hang-ngang'
                    headerFormat = getHeaderHorizontal()
                    let result = formatHorizontal(resultRows, steps)
                    images = result.images
                    dataFormat = result.data
                }

                let datas = [...headerFormat, ...dataFormat];
                const workbook = new Workbook();
                const worksheet = workbook.addWorksheet('Main sheet');
                worksheet.addRows(datas);
                if (merges) {
                    merges.map(m => worksheet.mergeCells(m))
                }

                if (images) {
                    images.map(image => {
                        if (image.length) {
                            image.map(i => {
                                worksheet.addImage(workbook.addImage({
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

                const styleHeaderFont = {
                    bold: true,
                }

                const styleHeaderFill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'AFAFAF' },
                }
                worksheet.getRow(1).font = styleHeaderFont;
                worksheet.getRow(1).fill = styleHeaderFill;
                worksheet.getRow(1).height = 30;
                worksheet.getRow(1).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }

                if (option == optionDefault) {
                    worksheet.getColumn(2).width = 70;
                    worksheet.getRow(2).font = styleHeaderFont;
                    worksheet.getRow(2).fill = styleHeaderFill;
                    worksheet.getRow(2).height = 30;
                    worksheet.getRow(2).border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                }

                if (option == optionVertical) {
                    worksheet.getColumn(2).width = 70;
                    worksheet.getColumn(3).width = 40;
                    worksheet.getColumn(4).width = 20;
                }

                if (option == optionHorizontal) {
                    worksheet.getColumn(1).width = 70;
                }

                let rowIndex = 1;
                for (rowIndex; rowIndex <= worksheet.rowCount; rowIndex++) {
                    worksheet.getRow(rowIndex).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                }

                let colIndex = 1;
                for (colIndex; colIndex <= worksheet.columnCount; colIndex++) {
                    if (option == optionDefault && colIndex > 3) {
                        worksheet.getColumn(colIndex).width = 30;
                    }

                    if (option == optionHorizontal && colIndex > 1) {
                        worksheet.getColumn(colIndex).width = 30;
                    }
                }

                workbook.xlsx.writeBuffer().then((buffer) => {
                    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName + `-${dayjs().format('YYYY-MM-DD')}.xlsx`);
                });

                this.setState({ loading: false })
            }
        });
    }

    /**
     * 
     */
    exportExcelBackground = async () => {
        let params = this.formRef.current.getFieldsValue();
        let { t } = this.props;
        this.setState({ loading: true })
        if (params.date) {
            params.from_date = timeFormatStandard(params.date, dateFormat);
            params.to_date = timeFormatStandard(params.date, dateFormat);
            delete (params.date)
        }
        let param = {};
        let formData = convertToFormData(param)
        formData.append('type', EXCEL_IO_TYPE_OUTPUT_DAILY_TASK_VERTICAL_REPORT);
        formData.append('param[task_id]', params.task_id)
        formData.append('param[from_date]', params.from_date)
        formData.append('param[to_date]', params.to_date)
        let response = await exportBackground(formData);
        if (response.status) {
            this.setState({ loading: false })
            this.setState({ loading: false });
            const btn = (
                <a style={{ color: '#009aff' }} href={'/excel-io-logs'} target='_blank'>
                    {t('hr:open')}
                </a>
            );

            showNotify(t('notification'), 'Yêu cầu thành công! Bấm để mở danh sách đợi Export-Import.', "success", 5, btn);
        } else {
            this.setState({ loading: false })
            showNotify(t('notification'), response.message, "error")
        }
    }

    /**
     * Render option default
     */
    renderOptionDefault = () => {
        let { rows, steps } = this.state
        let {t, baseData: { locations, majors } } = this.props
        return (
            <div className='daily-task'>
                <table className='table-daily-task'>
                    <thead>
                        <tr>
                            <th rowSpan={2} className='fixed-header left-fixed begin'>{t('hr:begin')}</th>
                            <th rowSpan={2} className='fixed-header left-fixed name'>{t('name')}</th>
                            <th rowSpan={2}>{t('repeat')}</th>
                            {rows.map((row, locId) => {
                                let locFound = locations.find(l => l.id == locId)
                                return (
                                    <th colSpan={row.length} key={uniqueId('__loc_id')} className='header-loc'>{locFound ? locFound.name : ''}</th>
                                )
                            })}
                        </tr>
                        <tr>
                            {rows.map(row => row.map(item => {
                                let majorFound = majors.find(m => m.id == item.major_id)
                                return (
                                    <th className='top-fixed staff-name' key={item.id}>
                                        {item.staff_name} <br />
                                        <span className='staff-code'>#{item.code}</span>
                                        <br />
                                        <span className='major-name'>{majorFound ? majorFound.name : ''}</span>
                                    </th>
                                )
                            }))}
                        </tr>
                    </thead>
                    <tbody>
                        {steps.map(step => {
                            let resultByStaffs = [];
                            {
                                rows.map(row => {
                                    row.map(item => {
                                        let logFind = item.logs.find(l => step.id == l.step_id)
                                        let status;
                                        if (logFind?.status == 0) {
                                            status = 'WARNING'
                                        }
                                        if (step.action_id == 0 && logFind?.status == 1) {
                                            status = 'FINISHED'
                                        }
                                        if (step.action_id == 1 && logFind?.status == 1 && typeof logFind?.data?.images != 'undefined') {
                                            status = 'DONE'
                                        }
                                        if (step.action_id == 1 && logFind?.status == 1 && typeof logFind?.data?.images == 'undefined') {
                                            status = 'SYSTEM ERROR'
                                        }
                                        resultByStaffs.push(<td className={`text-center ${status == 'WARNING' ? 'text-danger' : ''}`} key={item.id}>
                                            <div>{status}</div>
                                            {logFind?.data?.note ? <div className='note'>{logFind.data.note}</div> : ''}
                                        </td>)
                                    })
                                })
                            }

                            return <tr key={step.id}>
                                <td className= {window.innerWidth < screenResponsive  ? t('begin') :'left-fixed begin'}>{step.begintime}</td>
                                <td className={window.innerWidth < screenResponsive  ? t('name') :'left-fixed name'}>{step.name}</td>
                                <td className='text-center'>{step.repeat}</td>
                                {resultByStaffs}
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>
        )
    }

    /**
     * OnChange valid
     * @param {*} value 
     * @param {*} taskLogId 
     */
    onChangeValid(value, taskLogId = 0) {
        let xhr = updateValid({ task_log_id: taskLogId, value });
        xhr.then(response => {
            if (response.status) {
                showNotify('Notify', 'Cập nhật thành công!');
                let dataSourceVerticalCopy = this.state.dataSourceVertical;
                let indexFound = dataSourceVerticalCopy.findIndex(d => d.id == taskLogId);
                if (indexFound > -1) {
                    dataSourceVerticalCopy[indexFound]['is_valid'] = value;
                    this.setState({ dataSourceVertical: dataSourceVerticalCopy })
                }
            } else {
                showNotify('Notify', response.message, 'error');
            }
        })
    }
    /**
     * Render option vertical
     */
    renderOptionVertical = () => {
        let {t, baseData: { locations, majors } } = this.props
        let { dataSourceVertical, dataLighBoxVertical } = this.state;

        const columns = [
            {
                title: t('step_name'),
                dataIndex: "step_name",
                width: "40%",
            },
            {
                title: t('standard_imge'),
                render: (r) => {
                    let result = [];
                    r.image_default.map((i) =>
                        result.push(
                            <LazyLoad>
                                <div
                                    className="mr-2"
                                    style={{ display: "inline" }}
                                    key={uniqueId("images_")}
                                >
                                    <ImageAnt
                                        style={{ objectFit: "cover" }}
                                        preview={{ src: getURLHR(i) }}
                                        src={getThumbnailHR(i, '100x70')}
                                        // width={100}
                                        // height={80}
                                    />
                                </div>
                            </LazyLoad>
                        )
                    );
                    return result;
                },
            },
            {
                title: t("image"),
                render: (r) => {
                    let result = [];
                    r.images.map((img) => {
                        let index = dataLighBoxVertical.findIndex(a => a == getURLHR(img))
                        result.push(
                            <LazyLoad>
                                <img
                                    onClick={() => this.setState({ toggler: true, photoIndex: index })}
                                    className="mr-2 cursor-pointer"
                                    key={uniqueId("images_")}
                                    style={{ objectFit: "cover" }}
                                    src={getThumbnailHR(img, '100x70')}
                                    // width={100}
                                    // height={80}
                                />
                            </LazyLoad>
                        );
                    });
                    return result;
                },
            },
            {
                title: t('note'),
                render: (r) => r.note
            },
            {
                title: t('time'),
                render: (r) => {
                    if (r.images && r.images.length) {
                        return timeFormatStandard(r.updated_at, "HH:mm DD-MM-YYYY")
                    }
                }
            },
            {
                title: t('staff_name'),
                render: (r) => {
                    let majorFound = majors.find((m) => m.id == r.major_id);
                    let locFound = locations.find((l) => l.id == r.staff_loc_id);
                    return (
                        <span>
                            {r.staff_name}{" "}
                            <small>
                                <strong> #{r.code}</strong>
                                <br />
                                {majorFound?.name} - {locFound?.name}
                            </small>
                        </span>
                    );
                },
            },
            {
                title: t('hr:begin'),
                dataIndex: "begintime",
            },
            {
                title: t('hr:isvalid'),
                render: (r) =>
                    r.images.length ? (
                        <Dropdown
                            value={r.is_valid}
                            onChange={(v) => this.onChangeValid(v, r.id)}
                            datas={{ 0: t('undefined'), 1: t('valid'), 2: t('invalid') }}
                        />
                    ) : (
                        ""
                    ),
            },
        ];

        return (
            <Table
                columns={columns}
                dataSource={dataSourceVertical}
                pagination={{ pageSize : 30 }}
                rowKey='id'
            />
        )
    }

    /**
     * Render option horizontal
     */
    renderOptionHorizontal = () => {
        let { dataSourceHorizontal, headerHorizontal } = this.state;
        const {t} = this.props
        return <div className='daily-task'>
            <table className='table-daily-task'>
                <thead>
                    <tr>
                        <th style={{ minWidth: 400, maxWidth: 400 }} className= {window.innerWidth < screenResponsive  ?'' :'fixed-header left-fixed'}>{t('name')}</th>
                        <th className={window.innerWidth < screenResponsive  ?'' :'fixed-header left-fixed'}>{t('standard_imge')}</th>
                        {headerHorizontal.map(h => <th key={uniqueId('th__')} style={{ zIndex: 1 }}>
                            <span>{h.staff_name}</span>
                            <small>
                                <span><strong> (#{h.code})</strong></span><br />
                                <span> {h.major_name}</span> -
                                <span> {h.loc_name}</span>
                            </small>
                        </th>)}
                    </tr>
                </thead>
                <tbody>
                    {dataSourceHorizontal.map(row => {
                        let result = []
                        row.map((item, index) => result.push(<td key={uniqueId('td__')} className={index == 0 ? 'left-fixed' : ''}>{item}</td>))
                        return <tr key={uniqueId('tr__')}>{result}</tr>
                    })}
                </tbody>
            </table>
        </div>
    }

    /**
     * Render lighbox
     * @returns 
     */
    renderLighBox = () => {
        let { toggler, photoIndex, option, dataLighBoxHorizontal, dataLighBoxVertical } = this.state;

        let arrFullUrl = [];
        if (option == optionVertical) {
            arrFullUrl = dataLighBoxVertical
        } else if (option == optionHorizontal) {
            arrFullUrl = dataLighBoxHorizontal
        }

        if (!toggler) return '';
        return (
            <Lightbox
                mainSrc={arrFullUrl[photoIndex]}
                nextSrc={arrFullUrl[(photoIndex + 1) % arrFullUrl.length]}
                prevSrc={
                    arrFullUrl[
                    (photoIndex + arrFullUrl.length - 1) % arrFullUrl.length
                    ]
                }
                onCloseRequest={() => this.setState({ toggler: false })}
                onMovePrevRequest={() =>
                    this.setState({
                        photoIndex:
                            photoIndex == 0
                                ? 0
                                : (photoIndex + arrFullUrl.length - 1) % arrFullUrl.length,
                    })
                }
                onMoveNextRequest={() =>
                    this.setState({
                        photoIndex:
                            photoIndex == arrFullUrl.length - 1
                                ? arrFullUrl.length - 1
                                : (photoIndex + 1) % arrFullUrl.length,
                    })
                }
            />
        );
    }
    changeSchedule(value){
        this.setState({loading : true , typeSchedule : value})
        let xhr = searchForDropDownTask({schedule : value})
        xhr.then(res => {
            if(res.status){
                this.setState({loading : false, listTasks : res.data  }, this.formRef.current.resetFields(['task_id']))
            }
        })
        xhr.catch(err => console.log(err))

    }
    render() {
        let { option, dataVerify } = this.state;
        let {t, baseData: { locations } } = this.props;
        let scheduleListFormat = scheduleList.filter(s => s.id != 5 ) // remove staff schedule
        return (
            <Spin spinning={this.state.loading}>
                <PageHeader title={t('daily_task_report')} />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabList(this.props)} />
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={24}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item>
                                    <Dropdown value={this.state.typeSchedule} 
                                    datas={scheduleListFormat} 
                                    defaultOption={t('all_schedule')} 
                                    onChange={v => this.changeSchedule(v)}
                                    onClear={() => this.setState({typeSchedule: null})}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} hidden={this.state.typeSchedule < 2 ? false : true}>
                                <Form.Item name='date'>
                                    <DatePicker format={dateFormat} className='w-100' />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} hidden={this.state.typeSchedule == 2 ? false : true}>
                                <Form.Item name='dateWeek'   rules={[{ required: this.state.typeSchedule == 2 ? true : false, message: t('select_date') }]}>
                                    <DatePicker className='w-100' picker="week"/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={6} hidden={this.state.typeSchedule == 3 ? false : true}>
                                <Form.Item name='dateMonth' rules={[{ required: this.state.typeSchedule == 3 ? true : false , message: t('select_date') }]}>
                                    <DatePicker.RangePicker format={dateFormat} className='w-100' />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <Form.Item name='task_id' 
                                hasFeedback rules={[{ required: true, message: t('select_task') }]}
                                >
                                    <Dropdown datas={this.state.listTasks} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name='location_id'>
                                    <Dropdown datas={locations} defaultOption={t('all_location')} mode='multiple' />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name='staff_id'>
                                    <StaffDropdown defaultOption={t('all_staff')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={8}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" className='mr-2'>
                                        {t('search')}
                                    </Button>
                                    {
                                        checkPermission('hr-daily-task-report-export') ? 
                                            <Button key="export-staff" type='primary' onClick={() => this.exportData()}
                                                icon={<FontAwesomeIcon icon={faFileExport} />}> {t('export_file')}
                                            </Button>
                                        : ''
                                    }             
                                    <Button className='ml-2' key="export-staff" type='primary' onClick={() => this.exportExcelBackground()} 
                                        icon={<FontAwesomeIcon />}> {t('hr:export_background')}
                                    </Button> 
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24} className={window.innerWidth < screenResponsive  ?'card pl-2 pr-2 pb-2' :'p-3'}>
                        <Tabs className= {window.innerWidth < screenResponsive  ?'' :'p-3'} defaultActiveKey={optionDefault} onChange={value => this.setState({ option: value })}>
                            <Tabs.TabPane tab={t('daily_task_report')} key={optionDefault}>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab={t('hr:vertical_colum')} key={optionVertical}>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab={t('hr:horizontal_row')} key={optionHorizontal}>
                            </Tabs.TabPane>
                        </Tabs>
                        {option == optionDefault ? this.renderOptionDefault()
                            : option == optionVertical ? this.renderOptionVertical()
                                : this.renderOptionHorizontal()
                                    
                        }
                    </Col>
                </Row>
                {this.renderLighBox()}
            </Spin>
        )
    }
}

const mapStateToProps = (state) => ({
    baseData: state.baseData
})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(DailyTask)
