import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Col, Form, DatePicker, Button, Table } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Tab from '~/components/Base/Tab';
import tabList from '../config/tabList';
import { dateFormat, timeFormat, screenResponsive } from '~/constants/basic';
import Dropdown from '~/components/Base/Dropdown';
import StaffDropdown from '~/components/Base/StaffDropdown';
import ExportXLSButton from '~/components/Base/ExportXLSButton';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { getTimesheetReport as apiGetTimesheetReport } from '~/apis/company/timesheet';
import { timeFormatStandard, parseIntegertoTime, checkPermission } from '~/services/helper'
import { Link } from 'react-router-dom';
import '../config/index.css';


const FormItem = Form.Item;
const { RangePicker } = DatePicker;
class TimesheetReport extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            reports: [], 
        }
    }

    componentDidMount() {
        const {auth: {staff_info}} = this.props;
        this.formRef.current.setFieldsValue({
            date: [dayjs(dayjs().startOf('month'), dateFormat), dayjs(dayjs(), dateFormat)] , 
            department_id : staff_info.staff_dept_id ,
            location_id : staff_info.staff_loc_id
        })
        let values = this.formRef.current.getFieldsValue();
        this.getListTimesheetReport(values)
    }

    async getListTimesheetReport(params = {}) {
        this.setState({ loading: true });
        if(params.date) {
            params.from_date = timeFormatStandard(params.date[0], dateFormat)
            params.to_date = timeFormatStandard(params.date[1], dateFormat)
            delete(params.date)
        }
        let response = await apiGetTimesheetReport(params);
        if(response.status) {
            let result = [];
            let { data } = response;
            Object.keys(data).sort((key1, key2) =>{
                let r1v = data[key1]['late_check_in'] + data[key1]['early_check_out'] + data[key1]['forget_check_out'];
                let r2v = data[key2]['late_check_in'] + data[key2]['early_check_out'] + data[key2]['forget_check_out'];
                return r2v - r1v;
            }).map(key => result.push(data[key]))
            this.setState({ loading: false, reports: result });
        }
        else {
            this.setState({ loading: false })
        }
    }

    /**
     * @event handle submit form search
     */
    submitForm(values) {
        this.getListTimesheetReport(values);
    }

    /**
     * format data for excel
     */
    formatExportCell() {
        let { t, baseData: { departments, locations, positions } } = this.props;
        let header = [['No.', 'Code', 'Staff Name', 'Position', 'Dept', 'Location', 'Working Days', 'Late Checkin', 'Early Checkout',
                        'Forget Checkout','Vi phạm chuyên cần','Leave Days','Phép năm','Không lương','Chuyển ca','Nghỉ lễ','Nghỉ chế độ',
                        'Phép năm còn lại','Giờ làm việc','Giờ đi trễ','Giờ tăng ca']];
        let result = [];
        let { reports } = this.state;

        if (reports && reports.length > 0) {
            reports.map(r => {
                let positionName = 'N/A';
                let departmentName = 'N/A';
                let locationName = 'N/A';
                positions.map(p => { if(p.id == r.position_id) positionName = p.name });
                departments.map(d => { if(d.id == r.department_id) departmentName = d.name });
                locations.map(l => { if(l.id == r.location_id) locationName = l.name });

                result.push([
                    String(reports.indexOf(r) + 1), 
                    r.staff_code,
                    r.staff_name,
                    positionName,
                    departmentName,
                    locationName,
                    String(r.working_days),
                    String(r.late_check_in),
                    String(r.early_check_out),
                    String(r.forget_check_out),
                    String(this.formatColumnTable(r, 'violation')),
                    String(r.leave_count),
                    String(r.leave_count_type['A']),
                    String(r.leave_count_type['C']),
                    String(r.leave_count_type['W'] + r.leave_count_type['BT']),
                    String(r.leave_count_type['H']),
                    String(r.leave_count_type['R']),
                    String(r.annual_remaining),
                    String(this.formatColumnTable(r, 'working_time')),
                    String(this.formatColumnTable(r, 'late_time')),
                    String(this.formatColumnTable(r, 'ot_time')),
                ])
            })
        }

        return [...header, ...result.length > 0 ? result : [[]]]
    }

    /**
     * Format data by column
     * @param {*} record 
     * @param {*} column 
     */
    formatColumnTable = (r, column = '') => {
        switch (column) {
            case 'violation':
                let check = r.late_check_in + r.early_check_out;
                let result = (check > 0) ? Math.floor(check / 3) : 0;
                result += Math.floor(r.forget_check_out / 3);
                result += Math.floor(r.leave_count_type['C'] / 3);
                return result;
            case 'working_time':
                return Math.ceil(Number(r.working_time/3600) * 10)/10;
            case 'late_time':
                return Math.ceil(Number(r.late_time/3600) * 10)/10;
            case 'ot_time':
                return Math.ceil(Number(r.ot_time/3600) * 10)/10;
            default:
                break;
        }
    }

    /**
     * Export timesheet report
     */
    exportTimeSheetReport = () => {

    }

    render() {
        let { t, baseData: { locations, departments, divisions, positions, majors} } = this.props;
        const columns = [
            {
                title: t('No.'),
                render: r => this.state.reports.indexOf(r) + 1,
                width: 30
            },
            {
                title: t('hr:dept') + '/' + t('hr:section') +'/' +t('hr:location'),
                render: r => {
                    let deparment = departments.find(d => r.department_id == d.id);
                    let division = divisions.find(d => r.division_id == d.id)
                    let location = locations.find(l => r.location_id == l.id)
                    return (
                        <>
                            <strong>{deparment && deparment.name}</strong><br></br>
                            <small>{division && division.name}</small>
                            <small>{location && location.name}</small>
                        </>
                    )
                },
                sorter: (a, b) => a.department_id - b.department_id,
                width: 100
            },

            {
                title: t('hr:name'),
                render: r => {
                    return (
                        <>
                            <span>
                                {t('hr:staff_code')}: <strong>{r.staff_code}</strong> 
                                / {positions.map(p => p.id == r.position_id && p.name)}
                            </span>
                            <br></br>
                            <span>{r.staff_name}</span>
                        </>
                    )
                },
                sorter: (a, b) => a.staff_code - b.staff_code,
                width: 100
            },
            {
                title: t('hr:working_days'),
                render: r => <Link to={{
                        pathname: "/company/timesheet",
                        params: {
                            ...this.formRef.current.getFieldsValue(),
                            staff_code: r.staff_code
                        }
                    }}>
                    {r.working_days}
                    </Link>,
                align: 'right',
                sorter: (a, b) => a.working_days - b.working_days,
                width: 50
            },
            { 
                title: t('hr:late_for_timekeeping'),
                render: r => <Link to={{
                    pathname: "/company/timesheet",
                    params: {
                        ...this.formRef.current.getFieldsValue(),
                        staff_code: r.staff_code,
                        status: [64],
                    }
                }}>
                    {r.late_check_in}</Link>,
                align: 'right',
                sorter: (a, b) => a.late_check_in - b.late_check_in,
                width: 50
            },
            {
                title: t('hr:early_checkout'),
                render: r => <Link to={{
                    pathname: "/company/timesheet",
                    params: {
                        ...this.formRef.current.getFieldsValue(),
                        staff_code: r.staff_code,
                        status: [128],
                    }
                }} >{r.early_check_out}</Link>,
                align: 'right',
                sorter: (a, b) => a.early_check_out - b.early_check_out,
                width: 50
            },
            {
                title: t('hr:forget_timekeeping'),
                dataIndex: 'forget_check_out',
                align: 'right',
                sorter: (a, b) => a.forget_check_out - b.forget_check_out,
                width: 50
            },
            {
                title: t('hr:attendance_violation'),
                render: r => this.formatColumnTable(r, 'violation'),
                align: 'right',
                width: 50,
                sorter: (a, b) => a.violation - b.violation,
            },
            {
                title: t('hr:day_off'),
                render: r => <Link to={{
                    pathname: "/company/staff-leave",
                    params: {
                        ...this.formRef.current.getFieldsValue(),
                        staff_id: r.staff_id,
                    }
                }}>{r.leave_count}</Link>,
                className: 'bg-leave-day',
                align: 'right',
                sorter: (a, b) => a.leave_count - b.leave_count,
                width: 40
            },
            {
                title: t('hr:unpaid_leave'),
                render: r => r.leave_count_type['C'],
                align: 'right',
                sorter: (a, b) => a.leave_count_type['C'] - b.leave_count_type['C'],
                width: 50
            },
            {
                title: t('hr:annual_leave'),
                render: r => r.leave_count_type['A'],
                align: 'right',
                sorter: (a, b) => a.leave_count_type['A'] - b.leave_count_type['A'],
                width: 40
            },
            {
                title: t('hr:holiday'),
                render: r => r.leave_count_type['H'],
                align: 'right',
                sorter: (a, b) => a.leave_count_type['H'] - b.leave_count_type['H'],
                width: 30
            },
            {
                title: t('hr:regime_leave'),
                render: r => r.leave_count_type['R'],
                align: 'right',
                sorter: (a, b) => a.leave_count_type['R'] - b.leave_count_type['R'],
                width: 30
            },
            {
                title: t('hr:shift_change'),
                render: r => r.leave_count_type['W'] + r.leave_count_type['SC'],
                align: 'right',
                sorter: (a, b) => a.leave_count_type['W'] - b.leave_count_type['W'],
                width: 50
            },
            {
                title: t('hr:remaining_years'),
                render: r => r.annual_remaining ,
                align: 'right',
                sorter: (a, b) => a.annual_remaining - b.annual_remaining,
                width: 40
            },
            {
                title: t('hr:standard_working_time'),
                render: r => this.formatColumnTable(r, 'working_time'),
                align: 'right',
                sorter: (a, b) => a.working_time - b.working_time,
                width: 40
            },
            {
                title: t('hr:late_time'),
                render: r => this.formatColumnTable(r, 'late_time'),
                align: 'right',
                sorter: (a, b) => a.late_time - b.late_time,
                width: 40
            },
            {
                title: t('hr:overtime'),
                render: r => this.formatColumnTable(r, 'ot_time'),
                align: 'right',
                sorter: (a, b) => a.ot_time - b.ot_time,
                width: 40,
            }
        ];

        const disabledDate = current => {
            let dateSub6Months = dayjs().subtract(12,'months');
            return current && current < dateSub6Months;
        };

        return (
            <>
                <PageHeader 
                    title={t('hr:timesheet')}
                    subTitle={t('hr:report')}/>

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
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                <FormItem name="date">
                                    <RangePicker format={dateFormat} style={{ width: '100%' }} disabledDate={disabledDate} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                <FormItem name="location_id" >
                                    <Dropdown datas={locations} defaultOption="-- All Locations --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                <FormItem name="department_id" >
                                    <Dropdown datas={departments} defaultOption="-- All Departments --" />
                                </FormItem>
                            </Col>
                           
                        </Row>
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="division_id" >
                                    <Dropdown datas={divisions} defaultOption="-- All Sections --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="position_id" >
                                    <Dropdown datas={positions} defaultOption="-- All Positions --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="major_id" >
                                    <Dropdown datas={majors} defaultOption="-- All Majors --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <FormItem name="staff_code" >
                                    <StaffDropdown defaultOption="-- All Staffs --" valueIsCode />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6} key='submit' className='mb-3'>
                                <FormItem>
                                    <Button type="primary" htmlType="submit" className='mr-2'>
                                        {t('hr:search')}
                                    </Button>
                                    {
                                        checkPermission('hr-timesheet-report-export') ? 
                                            <ExportXLSButton key="export-staff"
                                                dataPrepare={this.formatExportCell.bind(this)}
                                                fileName={`Timesheet-report-${dayjs().format('YYYY-MM-DD')}`}
                                                autofit={0}
                                                type="primary"
                                                icon={<FontAwesomeIcon icon={faFileExport} />}
                                            >
                                                &nbsp;{t('hr:export')}
                                            </ExportXLSButton> : ''
                                    }
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </Row>

                <Row gutter={24}>
                    <Col span={24}>
                        <div>
                            <Table 
                                scroll={{ x: '80vw' }}
                                className='table-report-timesheet'
                                dataSource={this.state.reports}
                                loading={this.state.loading}
                                columns={columns}
                                rowKey={(report) => report.staff_id}
                                pagination={false}
                                rowClassName={r => {
                                    let check = r.late_check_in + r.early_check_out;
                                    let violation = (check > 0) ? Math.floor(check / 3) : 0;
                                    violation += Math.floor(r.forget_check_out / 3);
                                    violation += Math.floor(r.leave_count_type['C'] / 3);
                                    let violationPercent = r.working_days ? (violation / r.working_days)*100 : 100;
                                    return violationPercent > 50 ? 'bg-sunshine' : '';
                                }}
                            />
                        </div>
                    </Col>
                </Row>
            </>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TimesheetReport));