import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Input, Form, Popconfirm, DatePicker, Tooltip } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faSearch, faEye, faChartBar, faList } from '@fortawesome/free-solid-svg-icons';
import { getList as apiGetList } from '~/apis/company/timesheet';
import { basicField, dateFormat, dateTimeFormat, timeFormat, timesheetStatus } from '~/constants/basic';
import { Link } from 'react-router-dom';
import Dropdown from '~/components/Base/Dropdown';
import StaffDropdown from '~/components/Base/StaffDropdown';
import { parseIntegertoTime, timeFormatStandard, exportToXLS, historyReplace, historyParams, showNotify, exportToXLSMultipleSheet, checkPermission } from '~/services/helper';
import ExcelService from '~/services/ExcelService';
import Tab from '~/components/Base/Tab';
import tabList from './config/tabList';
import './config/index.css';
import TimesheetForm from '~/scenes/Company/Timesheet/TimesheetForm';
import dayjs from 'dayjs';
import { getHeader, formatData, getSummaryHeader, formatSummaryData } from '~/scenes/Company/Timesheet/config/exportSalary';
import { exportData as apiExportSalary, getSalaryConfigByConditions } from '~/apis/company/salary';
import { getShifts } from '~/apis/company/timesheet';
import {
    salaryStyles,
    summarySalaryStyles
} from './config/exportSalaryStyles';

import {screenResponsive} from '~/constants/basic';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

class Timesheet extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        let params = historyParams();
        let page = 1;
        let limit = params.limit ? params.limit : 35;
        if (params.offset) {
            page = params.offset / limit + 1;
        }

        this.state = {
            loading: false,
            limit: 35,
            timesheets: [],
            visableTimesheetForm: false,
            timesheet: null,
            total: 10000,
            page
        };
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        const {auth: {staff_info}} = this.props;
        let params = historyParams();
        if (params.from_date && params.to_date) {
            params.date = [dayjs(params.from_date, dateFormat), dayjs(params.to_date, dateFormat)];
        } else {
            params.date = [dayjs().subtract(1, 'months'), dayjs()];
        }

        params.department_id = params?.department_id ? params.department_id : staff_info.staff_dept_id;
        params.status = params?.status ? [params.status] : []
        params.major_id = params?.major_id ? params.major_id : []

        
        this.formRef.current.setFieldsValue(params)

        let values = this.formRef.current.getFieldsValue();
        this.getTimesheets(values);
    }

    /**
     * Get list timesheets
     * @param {} params 
     */
    async getTimesheets(params = {}) {
        this.setState({ loading: true });
        params.from_date = params.date ? timeFormatStandard(params.date[0], dateFormat) : ''
        params.to_date = params.date ? timeFormatStandard(params.date[1], dateFormat) : ''
        delete (params.date)
        let values = {
            ...params,
            limit: this.state.limit,
            offset: (this.state.page - 1) * this.state.limit
        }
        historyReplace(values);
        let response = await apiGetList({
            ...values,
        });
        if (response.status) {
            let { data } = response;
            this.setState({
                timesheets: data.rows,
                loading: false,
            });
        }
    }
    /**
     * @event change page
     * 
     * @param {*} page 
     */
    onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getTimesheets({ ...values }));
    }

    /**
     * @event submit form
     * @param {Object} values 
     */
    submitForm = (values) => {
        this.getTimesheets(values);
    }

    /**
     * Format export XLS
     */
    async formatExportCell() {
        this.setState({ loading: true })
        let { t, baseData: { departments, locations, majors, divisions, positions } } = this.props;
        let header = [['No.', 'Date', 'Code', 'Name', 'Department', 'Location', 'Check In', 'Check Out', 'Status']];
        let result = [];

        let headerDetail = [['Code', 'Name', 'Position', 'Department', 'Location', 'Major', 'Section', 'Working Day', 'Time At Company']];
        let resultDetail = [];

        let params = this.formRef.current.getFieldsValue();
        params.from_date = params.date ? timeFormatStandard(params.date[0], dateFormat) : ''
        params.to_date = params.date ? timeFormatStandard(params.date[1], dateFormat) : ''
        delete (params.date)
        let values = {
            ...params,
            limit: 20000,
            offset: 0
        };
        let res = await apiGetList(values);
        let timesheets = res.data.rows;
        if (timesheets && timesheets.length > 0) {
            let timesheetByStaff = []
            timesheets.map(r => {
                // format column check in out
                let checkInOut = r.check_in ? parseIntegertoTime(r.check_in, timeFormat) : '--';
                checkInOut += '/'
                checkInOut += r.check_out ? parseIntegertoTime(r.check_out, timeFormat) : '--';

                // format column Valid
                let valid = '';
                if ((r.status & 1) == 1) valid = t('Correct')
                else if ((r.status & 2) == 2) valid = t('Wrong')
                else valid = t('Un-clear')

                // format column department 
                let departmentName = ''
                departments.map(d => {
                    if (d.id == r.department_id)
                        return departmentName = d.name
                });

                // format column location
                let locationName = ''
                locations.map(l => {
                    if (l.id == r.location_id_out)
                        return locationName = l.name
                    if (l.id == r.location_id)
                        return locationName = l.name
                });

                result.push([
                    timesheets.indexOf(r) + 1,
                    r.date,
                    r.staff_code,
                    r.staff && r.staff.staff_name,
                    departmentName,
                    locationName,
                    checkInOut,
                    r.staff_schedule ? parseIntegertoTime(r.staff_schedule.staffsche_time_in, timeFormat) +
                        '/' + parseIntegertoTime(r.staff_schedule.staffsche_time_out, timeFormat)
                        : '--/--',
                    valid
                ])

                let timeAtCompany = 0;
                if (r.check_out && r.check_in) {
                    timeAtCompany = Number(r.check_out - r.check_in) / 3600;
                }

                // Format sheet detail
                if (typeof timesheetByStaff[r.staff_code] != 'undefined') {
                    // Tính ngày làm việc
                    if (typeof timesheetByStaff[r.staff_code]['location'][r.location_id] != 'undefined') {
                        timesheetByStaff[r.staff_code]['location'][r.location_id] += 1;
                    } else {
                        timesheetByStaff[r.staff_code]['location'][r.location_id] = 1;
                    }

                    // Tính giờ tại công ty
                    if (typeof timesheetByStaff[r.staff_code]['time_at_company'][r.location_id] != 'undefined') {
                        timesheetByStaff[r.staff_code]['time_at_company'][r.location_id] += timeAtCompany;
                    } else {
                        timesheetByStaff[r.staff_code]['time_at_company'][r.location_id] = timeAtCompany;
                    }
                } else {
                    let locationCount = []
                    locationCount[r.location_id] = 1;
                    let totalTime = [];
                    totalTime[r.location_id] = timeAtCompany;
                    timesheetByStaff[r.staff_code] = {
                        detail: r.staff,
                        location: locationCount,
                        time_at_company: totalTime
                    }
                }
            })

            timesheetByStaff.map((item, code) => {
                let deptFind = departments.find(d => d.id == item.detail.staff_dept_id);
                let majorFind = majors.find(m => m.id == item.detail.major_id)
                let divisionFind = divisions.find(d => d.id == item.detail.division_id)
                let positionFind = positions.find(d => d.id == item.detail.position_id)
                item.location.map((countTimesheet, locationId) => {
                    let locFind = locations.find(l => l.id == locationId);
                    resultDetail.push([
                        code,
                        item.detail.staff_name,
                        positionFind ? positionFind.name : '',
                        deptFind ? deptFind.name : '',
                        locFind ? locFind.name : '',
                        majorFind ? majorFind.name : '',
                        divisionFind ? divisionFind.name : '',
                        countTimesheet,
                        typeof item.time_at_company[locationId] ? item.time_at_company[locationId] : 0
                    ])
                });
            })

            let dataXls = {
                'List': {
                    datas: [...header, ...result],
                    autofit: [null, null, null, { width: 25 }, null, { width: 25 }, { width: 25 }, { width: 25 }]
                },
                'Detail': {
                    datas: [...headerDetail, ...resultDetail],
                    autofit: [null, { width: 25 }, { width: 15 }, { width: 20 }, { width: 20 }]
                }
            }

            let fileName = `Timesheet-${dayjs().format('YYYY-MM-DD')}`;
            exportToXLSMultipleSheet(fileName, dataXls)
        } else {
            showNotify(t('hr:notification'), t('hr:no_data'), 'warning');
        }
        this.setState({ loading: false });
    }

    /**
     * Format export salary cell
     */
    async exportSalaryToXLS() {
        this.setState({ loading: true })

        // Get rows
        let params = this.formRef.current.getFieldsValue();
        if (params.date && Array.isArray(params.date)) {
            params.from_date = params.date[0].format(dateFormat);
            params.to_date = params.date[1].format(dateFormat);
            delete (params.date);
        }
        if (params.staff_code) {
            params.staff_code = [params.staff_code];
        }
        let response = await apiExportSalary(params);
        if (response.status) {
            let { rows, file_name, reasons, ots } = response.data;
            let timeShifts = {};
            let salaryStaffConfigs = {};
            let shiftRes = await getShifts();

            let salaryStaffConfigsRes = await getSalaryConfigByConditions(params);
            if (salaryStaffConfigsRes.status) {
                salaryStaffConfigs = salaryStaffConfigsRes.data;
            }
            if (shiftRes.status) {
                timeShifts = shiftRes.data;
            }
            let datas = formatData(rows, reasons, ots, timeShifts);
            let sumaryDatas = formatSummaryData(rows, reasons, ots, timeShifts, salaryStaffConfigs);
            // console.log({ sumaryDatas })

            // let datas = [];
            // this.setState({ loading: false });
            // return;

            if (datas) {
                const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

                let excelService = new ExcelService(['Detail', 'Sum']);

                let header = getHeader();
                excelService.addWorksheetDatas([...header, ...datas])
                    .setWorksheetViews({ state: 'frozen', xSplit: 6 })
                    .addWorksheetStyles(salaryStyles)
                    .mergeCells(['A3:D3']);

                let sumaryHeader = getSummaryHeader(params);
                excelService.setActiveSheet('Sum')
                    .setWorksheetViews({ state: 'frozen', xSplit: 13 })
                    .addWorksheetDatas([...sumaryHeader, ...sumaryDatas])
                    .addWorksheetStyles(summarySalaryStyles)
                    .mergeCells(['A2:D2', 'AX2:AZ2']);

                excelService.forceDownload(file_name, fileType);

                this.setState({ loading: false });
            }
        }
    }

    /**
     * @render
     */
    render() {
        let { t, baseData: { departments, divisions, majors, locations, positions } } = this.props;
        const columns = [
            {
                title: t('No.'),
                width:50,
                render: r => this.state.timesheets.indexOf(r) + 1,
            },
            {
                title: t('hr:date'),
                dataIndex: 'date'
            },
            {
                title: t('code'),
                width:100,
                dataIndex: 'staff_code'
            },
            {
                title: t('hr:name'),
                width:300,
                render: r => r.staff && r.staff.staff_name,
            },
            {
                title: t('hr:dept'),
                render: r => departments.find(d => d.id == r?.staff.staff_dept_id)?.name
            },
            {
                title: t('hr:location_of_staff'),
                width: 250,
                render: r => {
                    let staff_loc = locations.find(l => l.id ==  r.staff?.staff_loc_id)
                    return staff_loc?.name
                }
            },
            {
                title: t('hr:location'),
                width: 250,
                render: r => locations.map(l => l.id == r.location_id && l.name)
            },
            {
                title: t('hr:check_in') + '/' + t('hr:check_out'),
                width: 200,
                render: r => {
                    let result = r.check_in ? parseIntegertoTime(r.check_in, timeFormat) : '--';
                    result += '/'
                    result += r.check_out ? parseIntegertoTime(r.check_out, timeFormat) : '--';
                    return result;
                },
                align: 'center'
            },
            {
                title: t('hr:schedule'),
                width: 200,
                render: r => r.staff_schedule ?
                    parseIntegertoTime(r.staff_schedule.staffsche_time_in, timeFormat) +
                    '/' + parseIntegertoTime(r.staff_schedule.staffsche_time_out, timeFormat)
                    : '--/--',
                align: 'center'
            },
            {
                title: t('hr:valid'),
                width:100,
                render: r => {
                    let result = '';
                    if ((r.status & 1) == 1) result = t('Correct')
                    else if ((r.status & 2) == 2) result = t('Wrong')
                    else result = t('Un-clear')
                    return result;
                }
            },
            {
                title: t('hr:action'),
                width: 150,
                render: r => {
                    return (
                        <>
                            <Tooltip title={t('Detail')}>
                                <Button type='primary' size='small' onClick={() => this.setState({ visableTimesheetForm: true, timesheet: r })}>
                                    <FontAwesomeIcon icon={faEye} />
                                </Button>
                            </Tooltip>
                            {
                                r.schedule_staff_id ?
                                    <Tooltip title={t('Schedule')}>
                                        <Link to={`/company/staff-schedule/${r.schedule_staff_id}/edit`}>
                                            <Button type='primary' size='small' className='m-1'><FontAwesomeIcon icon={faSearch} /></Button>
                                        </Link>

                                    </Tooltip>
                                    : []
                            }
                        </>
                    )
                },
                align: 'center'
            }
        ];
        return (
            <div>
                <PageHeader title={t('hr:timesheet')} />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabList(this.props)} />
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12} >
                                <FormItem name="date">
                                    <RangePicker format={dateFormat} style={{ width: '100%' }} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6} >
                                <FormItem name="location_id" >
                                    <Dropdown datas={locations} defaultOption="-- All Locations --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <FormItem name="department_id" >
                                    <Dropdown datas={departments} defaultOption="-- All Departments --" />
                                </FormItem>
                            </Col>
                           
                        </Row>
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <FormItem name="division_id" >
                                    <Dropdown datas={divisions} defaultOption="-- All Sections --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <FormItem name="position_id" >
                                    <Dropdown datas={positions} defaultOption="-- All Positions --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <FormItem name="major_id" >
                                    <Dropdown datas={majors} defaultOption="-- All Majors --" mode="multiple" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <FormItem name="staff_code" >
                                    <StaffDropdown defaultOption="-- All Staffs --" valueIsCode={true} />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <FormItem name="status" >
                                    <Dropdown mode='multiple' datas={timesheetStatus} defaultOption="-- All Status --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                                <FormItem name="is_diff_loc" >
                                    <Dropdown datas={basicField} defaultOption="-- Is diff --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={18} xl={18} key='submit'>
                                <FormItem>
                                    <Button type="primary" htmlType="submit" className="mr-2">
                                        {t('hr:search')}
                                    </Button>                                
                                {/* <ExportXLSButton key="export-staff"
                                    dataPrepare={() => this.formatExportCell()}
                                    fileName={`Timesheet-${dayjs().format('YYYY-MM-DD')}`}
                                    autofit={0}
                                    type="primary"
                                    icon={<FontAwesomeIcon icon={faFileExport} />}
                                    className='mr-2'
                                >
                                    &nbsp;{t('Export')}
                                </ExportXLSButton> */}
                                {
                                        checkPermission('hr-timesheet-export') ? 
                                            <Button className='mr-2'
                                                type='primary'
                                                key="export-timesheet"
                                                onClick={() => this.formatExportCell()}
                                                icon={<FontAwesomeIcon icon={faFileExport} />}
                                                loading={this.state.loading}
                                            >
                                                {t('hr:export')}
                                            </Button>
                                        : ''
                                }                           
                                    <Button
                                        type='primary'
                                        key="export-salary"
                                        onClick={() => this.exportSalaryToXLS()}
                                        icon={<FontAwesomeIcon icon={faFileExport} />}
                                        loading={this.state.loading}
                                    >
                                        {t('hr:salary')}
                                    </Button>
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </Row>

                <Row gutter={[4, 24]}>
                    <Col span={24}>
                        {window.innerWidth < screenResponsive  ? 
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'> 
                                    <Table
                                       dataSource={this.state.timesheets}
                                       columns={columns}
                                       loading={this.state.loading}
                                       showSorterTooltip={true}
                                       pagination={{
                                           total: this.state.total,
                                           pageSize: this.state.limit,
                                           hideOnSinglePage: true,
                                           showSizeChanger: false,
                                           current: this.state.page,
                                           onChange: page => this.onChangePage(page)
                                       }}
                                       rowKey={(timesheet) => timesheet.id}
                                       rowClassName={(timesheet) => (timesheet.status & 2) == 2 ? 'bg-yellow' : (timesheet.status & 4) == 4 ? 'bg-red' : ''}
                                    />
                                </div>
                            </div>
                            :
                            <Table
                                
                                dataSource={this.state.timesheets}
                                columns={columns}
                                loading={this.state.loading}
                                showSorterTooltip={true}
                                pagination={{
                                    total: this.state.total,
                                    pageSize: this.state.limit,
                                    hideOnSinglePage: true,
                                    showSizeChanger: false,
                                    current: this.state.page,
                                    onChange: page => this.onChangePage(page)
                                }}
                                rowKey={(timesheet) => timesheet.id}
                                rowClassName={(timesheet) => (timesheet.status & 2) == 2 ? 'bg-yellow' : (timesheet.status & 4) == 4 ? 'bg-red' : ''}
                            />
                        }
                    </Col>
                </Row>

                {this.state.visableTimesheetForm ?
                    <TimesheetForm
                        hidePopup={() => this.setState({ visableTimesheetForm: false })}
                        timesheet={this.state.timesheet}
                        visible={this.state.visableTimesheetForm} />
                    : []}
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Timesheet));
