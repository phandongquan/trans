import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Input, Form, DatePicker } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { getList as getListTaskReport } from '~/apis/company/task/taskLog';
import Tab from '~/components/Base/Tab';
import { timeFormatStandard, exportToXLS } from '~/services/helper';
import { Link } from 'react-router-dom';
import tabListTask from '~/scenes/Company/DailyTask/config/tabList';
import { dateFormat, dateTimeFormat, screenResponsive } from '~/constants/basic';
import dayjs from 'dayjs';
import Dropdown from '~/components/Base/Dropdown';
import { getList as apiGetListSheetSummary } from '~/apis/company/sheetSummary'
import { reportInMonth as apiReportInMonth } from '~/apis/company/task';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { formatData, formatHeader } from './config/ExcelReportLog';
import { exportData as apiExportSalary } from '~/apis/company/salary';
import { getList as apiGetListSchedule } from '~/apis/company/staffSchedule';
import { getVerticalColumnReport } from '~/apis/company/dailyTask';
import { getHeaderVertical, formatVertical  } from './config/ExportDetail';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

const FormItem = Form.Item;
class TaskLog extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            task: null, 
            report: [],
            workingDays: []
        };
        this.formRef = React.createRef();
    }

    /**
     * @lifecycle 
     */
    async componentDidMount() {
        this.formRef.current.setFieldsValue({ date: [dayjs().subtract(1, 'weeks'), dayjs()] })
        let values = this.formRef.current.getFieldsValue();
        this.getReportInMonth(values);
    }

    /**
     * Get report in month
     */
    getReportInMonth = async (params = {}) => {
        this.setState({ loading: true })
        let { task_id } = this.props.match.params;
        params.task_id = task_id;
        if(params.date) {
            params.from_date = typeof params.date != 'undefined' ? timeFormatStandard(params.date[0].startOf('day'), dateTimeFormat) : null;
            params.to_date = typeof params.date != 'undefined' ? timeFormatStandard(params.date[1].endOf('day'), dateTimeFormat) : null;
            delete(params.date);
        }
        let response = await apiReportInMonth(params);
        this.setState({ loading: false })
        if(response.status) {
            let { report, task } = response.data;
            this.setState({ report, task });
            let paramSalary = {
                from_date: timeFormatStandard(params.from_date, dateFormat),
                to_date: timeFormatStandard(params.to_date, dateFormat),
                department_id: task.department_id,
                location_id: task.location_id,
                position_id: task.position_id,
                major_id: params.major_id
            }
            this.getSchedule(paramSalary);
        }
    }

    /**
     * Get schedule
     * @param {*} params 
     */
    getSchedule = async (params = {}) => {
        this.setState({ loading: true })
        params.from_date = params.from_date ? dayjs(params.from_date).startOf('days').unix() : null;
        params.to_date = params.to_date ? dayjs(params.to_date).endOf('days').unix() : null;
        params.limit = 30000;
        params.offset = 0;
        params.is_manager = true;
        delete(params.position_id)
        delete(params.location_id)
        let response = await apiGetListSchedule(params);
        this.setState({ loading: false })
        if(response.status) {
            let workingDays = [];
            let { rows } = response.data;
            rows.map(r => {
                let characterShift = r.staffsche_shift.slice(0, 2);
                let isWork = ['AM','PM','HC'].indexOf(characterShift) > -1;
                if(typeof workingDays[r.staffsche_staff_id] != 'undefined') {
                    if(isWork) {
                        workingDays[r.staffsche_staff_id] += 1
                    }
                } else {
                    workingDays[r.staffsche_staff_id] = isWork ? 1 : 0;
                }
            })
            this.setState({ workingDays, loading: false })
        }
    }

    /**
     * Get data salary
     * @param {*} params 
     */
    getSalary = async (params = {}) => {
        this.setState({ loading: true })
        let response = await apiExportSalary(params);
        if(response.status) {
            let { rows } = response.data;
            let workingDays = [];
            Object.keys(rows).map(sche_staff_id => {
                let schedule = rows[sche_staff_id];
                let staffWork = 0;
                if (typeof schedule.days == 'object') {
                    Object.keys(schedule.days).map(day => {
                        let scheduleDay = schedule.days[day] != '' ? schedule.days[day] : {};
                        let work = scheduleDay?.work ? scheduleDay?.work : 0;
                        let leaveType = scheduleDay?.leave_type ? scheduleDay?.leave_type : '';
                        if (scheduleDay?.shift && ['H'].includes(scheduleDay?.shift)) { // Ngày nghỉ lễ
                            work = 1;
                        } else if (scheduleDay?.shift && ['C', 'W'].includes(scheduleDay?.shift)) { // Nghỉ tuần và nghỉ không lương
                            work = 0;
                        } else if (['C', 'W', 'S'].includes(leaveType) || ['C', 'LC', 'S'].includes(work)) {
                            work = 0;
                        } else if (['A', 'EL', 'F', 'R', 'L'].includes(leaveType)) {
                            work = 1;
                        } else if (['BT', 'WFH', 'OT'].includes(leaveType)) {
                            if (scheduleDay?.shift && ['C', 'W'].includes(scheduleDay?.shift)) {
                                work = 0;
                            } else {
                                work = 1;
                            }
                        }

                        if (
                            work == 0 && scheduleDay?.check_in && scheduleDay.check_out
                            && scheduleDay.check_in != 0 && scheduleDay.check_out != 0
                            && scheduleDay.shift 
                            && (scheduleDay.shift.includes('HC') || scheduleDay.shift.includes('AM') || scheduleDay.shift.includes('PM'))
                        ) {
                            work = 1;
                        }

                        staffWork = staffWork + Number(work);
                    })
                }

                workingDays[schedule.code] = staffWork
            })
            this.setState({ workingDays, loading: false })
        }
    }

    /**
     * Submit form search
     * @param {*} values 
     */
    submitForm = (values) => {
        this.setState({report: null, task: null}, () => this.getReportInMonth(values));

    }

    /**
     * Format excel with data report
     */
    exportExcel = () => {
        let { report, workingDays } = this.state;
        let header = formatHeader();
        let data = formatData(report, workingDays);
        let fileName = `Daily-task-log-report-${dayjs().format('YYYY-MM-DD')}`;
        let dataFormat = [...header, ...data]
        exportToXLS(fileName, dataFormat, [{width: 40}, null, null, {width: 20}, {width: 20}])
    }

    /**
     * Export excel details
     */
    exportExcelDetail = () => {
        this.setState({ loading: true })
        let params = this.formRef.current.getFieldsValue();
        if (params.date) {
            params.from_date = timeFormatStandard(params.date[0], dateFormat);
            params.to_date = timeFormatStandard(params.date[1], dateFormat);
            delete (params.date)
        }
        let { task_id } = this.props.match.params;
        params.task_id = task_id;
        let xhr = getVerticalColumnReport(params)
        xhr.then(res => {
            if(res.status) {
                let resultRows = [];
                let { rows, steps } = res.data;
                rows.map(r => {
                    if (typeof resultRows[r.staff_loc_id] == 'undefined') {
                        resultRows[r.staff_loc_id] = [r]
                    } else {
                        resultRows[r.staff_loc_id] = [...resultRows[r.staff_loc_id], r]
                    }
                })

                let fileName = `Daily-task-log-report-detail-${dayjs().format('YYYY-MM-DD')}`;
                let headerFormat = getHeaderVertical();
                let result = formatVertical(resultRows, steps);
                let dataFormat = result.data;

                let datas = [...headerFormat, ...dataFormat];
                const workbook = new Workbook();
                const worksheet = workbook.addWorksheet('Main sheet');
                worksheet.addRows(datas);

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

                worksheet.getColumn(1).width = 20;
                worksheet.getColumn(3).width = 70;
                worksheet.getColumn(4).width = 40;
                worksheet.getColumn(5).width = 20;

                let rowIndex = 1;
                for (rowIndex; rowIndex <= worksheet.rowCount; rowIndex++) {
                    worksheet.getRow(rowIndex).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                }

                workbook.xlsx.writeBuffer().then((buffer) => {
                    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName + `-${dayjs().format('YYYY-MM-DD')}.xlsx`);
                });

                this.setState({ loading: false })
            }
        })
    }

    /**
     * @render
     */
    render() {
        let {t, baseData: { locations, departments, majors, positions } } = this.props;
        let { task, workingDays } = this.state;
        let values = this.formRef.current?.getFieldsValue();
        let state = {
            task_id: task?.id,
            department_id: values?.department_id,
            location_id: values?.location_id,
            major_id: values?.major_id,
        }
        if(typeof values != 'undefined' && values.date) {
            state.from_date = values.date[0].format(dateFormat);
            state.to_date = values.date[1].format(dateFormat);
        }

        const columns = [
            {
                title: 'No.',
                render: r => this.state.report.indexOf(r) + 1
            },
            {
                title: t('staff'),
                render: r => <span>{r.staff_name} <small><strong>#{r.code}</strong></small></span>
            },
            {
                title: t('dept') + t(' / ') +t('major')+ t(' / ')  +  t('location') ,
                render: r => {
                    let deptFound = departments.find(d => d.id == r.staff_dept_id)
                    let majorFound = majors.find(m => m.id == r.major_id)
                    let locFound = locations.find(l => l.id == r.staff_loc_id)
                    return <span>{deptFound?.name}/ {majorFound?.name}/ {locFound?.name}</span>
                }
            },
            {
                title: t('finished'),
                render: r => <Link to={{pathname: '/company/daily-task/report-log/filter', state: { ...state, status: 2, staff_id: r.staff_id} }}>{r.finished}</Link>,
                align: 'center'
            },
            {
                title: t('unfinished'),
                render: r => <Link to={{pathname: '/company/daily-task/report-log/filter', state: { ...state, status: 1, staff_id: r.staff_id}}}>{r.un_finished}</Link>,
                align: 'center'
            },
            {
                title: t('notdone'),
                render: r => <Link to={{pathname: '/company/daily-task/report-log/filter', state: {...state, status: 0, staff_id: r.staff_id}}}>{r.not_done}</Link>,
                align: 'center'
            },
            {
                title: t('hr:count_daily_task'),
                render: r => <Link to={{pathname: '/company/daily-task/report-log/filter', state: {...state, staff_id: r.staff_id}}}>{r.total}</Link>,
                align: 'center'
            },
            {
                title: t('working_days'),
                render: r => workingDays[r.staff_id],
                align: 'center'
            },
            {
                title: t('Kpi ') + t('minute'),
                render: r => r.kpi,
                align: 'center'
            }
        ];

        return (
            <div>
                <PageHeader
                    title={t('hr:task_log_report')}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabListTask(this.props)}></Tab>
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        onFinish={(values) => this.submitForm(values)}
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={5} xl={5}>
                                <FormItem name="date">
                                    <DatePicker.RangePicker format={dateFormat} style={{ width: '100%' }} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="department_id" >
                                    <Dropdown datas={departments} defaultOption={t('hr:all_department')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="major_id" >
                                    <Dropdown datas={majors} defaultOption={t('hr:all_major')}/>
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="location_id" >
                                    <Dropdown datas={locations} defaultOption={t('hr:all_location')}/>
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="position_id" >
                                    <Dropdown datas={positions} defaultOption={t('hr:all_position')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={8} xl={8} key='submit'>
                                <FormItem>
                                    <Button type="primary" htmlType="submit">
                                        {t('search')}
                                    </Button>
                                    <Button
                                        type='primary'
                                        key="export-salary"
                                        onClick={() => this.exportExcel()}
                                        icon={<FontAwesomeIcon icon={faFileExport} />}
                                        loading={this.state.loading}
                                        className='ml-2'
                                    >
                                        {t('export_file')}
                                    </Button>
                                    <Button
                                        type='primary'
                                        key="export-detail"
                                        onClick={() => this.exportExcelDetail()}
                                        icon={<FontAwesomeIcon icon={faFileExport} />}
                                        loading={this.state.loading}
                                        className='ml-2'
                                    >
                                        {t('hr:export_detail')}
                                    </Button>
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        {window.innerWidth < screenResponsive  ? 
                                <div className='block_scroll_data_table'>
                                    <div className='main_scroll_table'> 
                                        <Table
                                            title={() => <strong>{task?.name}</strong>}
                                            dataSource={this.state.report}
                                            columns={columns}
                                            loading={this.state.loading}
                                            pagination={false}
                                            rowKey='staff_id'
                                        />
                                    </div>
                                </div>
                                :
                            <Table
                                title={() => <strong>{task?.name}</strong>}
                                dataSource={this.state.report}
                                columns={columns}
                                loading={this.state.loading}
                                pagination={false}
                                rowKey='staff_id'
                            />
                        }
                    </Col>
                </Row>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TaskLog));
