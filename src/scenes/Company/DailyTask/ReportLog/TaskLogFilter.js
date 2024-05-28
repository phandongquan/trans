import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Input, Form, DatePicker } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { getList as getListTaskReport } from '~/apis/company/task/taskLog';
import Tab from '~/components/Base/Tab';
import { timeFormatStandard, historyReplace, historyParams, exportToXLS, autofitColumnXLS } from '~/services/helper';
import { Link } from 'react-router-dom';
import tabListTask from '~/scenes/Company/DailyTask/config/tabList';
import { dateFormat } from '~/constants/basic';
import dayjs from 'dayjs';
import Dropdown from '~/components/Base/Dropdown';
import StaffDropdown from '~/components/Base/StaffDropdown';
import { getList as apiGetListTask } from '~/apis/company/task';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { formatHeader, formatData } from './config/ExcelTaskLogFilter';

const { RangePicker } = DatePicker;
const arrStatusDailyTask = { 0: 'Not Done', 1: 'Un Finished', 2: 'Finished'}
class TaskLogFilter extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            datas: [], 
            tasks: []
        };
        this.formRef = React.createRef();
    }

    /**
     * @lifecycle 
     */
    async componentDidMount() {
        let { state } = this.props.location;
        let params = historyParams();
        params = Object.keys(params).length ? params : typeof state != 'undefined' ? state : {};
        this.formRef.current.setFieldsValue({
            task_id: params.task_id,
            date: [dayjs(params.from_date), dayjs(params.to_date)],
            staff_id: params.staff_id,
            status: params.status
        })
        this.getTaskReport(params);
        this.getListTask();
    }

    /**
     * Get list task
     */
    getListTask = async () => {
        let response = await apiGetListTask({ limit: 1000 });
        if(response.status) {
            this.setState({ tasks: response.data.rows })
        }
    }

    /**
     * Get list staff
     * @param {} params 
     */
    getTaskReport = async (params = {}) => {
        this.setState({ loading: true });
        if(typeof params.date != 'undefined') {
            params.from_date = timeFormatStandard(params.date[0], dateFormat);
            params.to_date = timeFormatStandard(params.date[1], dateFormat);
            delete(params.date);
        }
        historyReplace(params);
        let response = await getListTaskReport(params);
        this.setState({ loading: false })
        if (response.status) {
            this.setState({ datas: response.data })
        }
    }

    /**
     * Submit form search
     */
    submitForm = (values) => {
        this.getTaskReport(values)
    }

    /**
     * Export excel
     */
    exportExcel = () => {
        let { datas } = this.state;
        let header = formatHeader();
        let data = formatData(datas);
        let fileName = `Daily-task-log-report-detail-${dayjs().format('YYYY-MM-DD')}`;
        let dataFormat = [...header, ...data]
        exportToXLS(fileName, dataFormat, [{width: 30}, {width: 20}, null, null, null, {width: 20}, {width: 10}])
    }

    /**
     * @render
     */
    render() {
        let { t, baseData: { locations, departments, majors } } = this.props;
        const columns = [
            {
                title: 'No.',
                render: r => this.state.datas.indexOf(r) + 1
            },
            {
                title: t('task'),
                render: r => r.task?.name
            },
            {
                title: t('staff'),
                render: r => <span>{r.staff?.staff_name} <small><strong>#{r.staff?.code}</strong></small></span>
            },
            {
                title: t('Department/ Major/ Location'),
                render: r => {
                    if(!r.staff) return '';
                    let deptFound = departments.find(d => d.id == r.staff.staff_dept_id)
                    let majorFound = majors.find(m => m.id == r.staff.major_id)
                    let locFound = locations.find(l => l.id == r.staff.staff_loc_id)
                    return <span>{deptFound?.name}/ {majorFound?.name}/ {locFound?.name}</span>
                }
            },
            {
                title: 'date',
                render: r => timeFormatStandard(r.created_at, dateFormat)
            },
            {
                title: t('finished'),
                render: r => r.status == 2 ? <Link to={`/company/daily-task/report-log/detail/${r.id}`}>1</Link> : 0,
                align: 'center'
            },
            {
                title: t('unfinished'),
                render: r => r.status == 1 ? <Link to={`/company/daily-task/report-log/detail/${r.id}`}>1</Link> : 0,
                align: 'center'
            },
            {
                title: t('notdone'),
                render: r => r.status == 0 ? <Link to={`/company/daily-task/report-log/detail/${r.id}`}>1</Link> : 0,
                align: 'center'
            },
        ];

        return (
            <div>
                <PageHeader
                    title={t('hr:task_log_report')}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabListTask(this.props)}></Tab>
                    <Form
                        className="pt-3 pb-2"
                        ref={this.formRef}
                        onFinish={this.submitForm.bind(this)}
                    >
                        <Row gutter={12}>
                            <Col span={6}>
                                <Form.Item name="task_id" hasFeedback rules={[{ required: true, message: t('hr:select_task') }]}>
                                    <Dropdown datas={this.state.tasks} defaultOption={t('task')} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name="staff_id" >
                                    <StaffDropdown defaultOption={t('hr:all_staff')} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name="date" >
                                    <RangePicker className='w-100'/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name="status" >
                                    <Dropdown datas={arrStatusDailyTask} defaultOption={t('hr:all_status')} />
                                </Form.Item>
                            </Col>
                            <Col span={8} key='submit'>
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
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Table
                            dataSource={this.state.datas}
                            columns={columns}
                            loading={this.state.loading}
                            pagination={false}
                            rowKey='id'
                        />
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TaskLogFilter));
