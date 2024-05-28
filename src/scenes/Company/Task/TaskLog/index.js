import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Input, Form, DatePicker } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { getList as getListTaskReport } from '~/apis/company/task/taskLog';
import { detail as apiDetailTask } from '~/apis/company/task'
import Tab from '~/components/Base/Tab';
import { timeFormatStandard, historyReplace, historyParams } from '~/services/helper';
import { Link } from 'react-router-dom';
import { UnorderedListOutlined } from '@ant-design/icons';
import tabListTask from '~/scenes/Company/DailyTask/config/tabList';
import { dateFormat, screenResponsive } from '~/constants/basic';
import dayjs from 'dayjs';
import Dropdown from '~/components/Base/Dropdown';
import iconChecked from '~/scenes/Company/Communication/config/checked.png'
import { getList as apiGetListSheetSummary } from '~/apis/company/sheetSummary'

const FormItem = Form.Item;
const status = [
    { id: 0, name: 'NotDone'},
    { id: 1, name: 'Unfinish'},
    { id: 2, name: 'Finished'},
];

class TaskLog extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            taskReports: [],
            dataTaskReportChart: [],
            task: null, 
        };
        this.formRef = React.createRef();
    }

    /**
     * @lifecycle 
     */
    async componentDidMount() {
        this.formRef.current.setFieldsValue({ indate: dayjs() })
        await this.getDetailTask()
        await this.getTaskReport();
    }

    /**
     * Get detail task
     */
    getDetailTask = async () => {
        this.setState({ loading: true });
        let { task_id } = this.props.match.params;
        let response = await apiDetailTask(task_id);
        this.setState({ loading: false });
        if(response.status) {
            this.setState({ task: response.data.task })
        }
    }

    /**
     * Submit form search
     * @param {*} values 
     */
    submitForm = (values) => {
        this.getTaskReport()
    }

    /**
     * Get list staff
     * @param {} params 
     */
    getTaskReport = async () => {
        this.setState({ loading: true });
        let values = this.formRef.current.getFieldsValue();
        let params = {}
        let month = dayjs().format('YYYY-MM')
        if(typeof values.indate != 'undefined') {
            params.from_date = timeFormatStandard(values.indate, dateFormat);
            params.to_date = timeFormatStandard(values.indate, dateFormat);
            month = timeFormatStandard(values.indate, 'YYYY-MM');
        }

        let { task } = this.state;
        params = {
            ...params,
            department_id: task.department_id,
            major_id: task.major_id,
            location_id: values.location_id ? values.location_id : task.location_id,
            task_id: task.id
        }
        let staffIds = [];
        let taskReports = []
        let response = await getListTaskReport(params);
        if (response.code == 200) {
            let { data } = response;
            data.map(d => staffIds.push(d.staff_id))
            taskReports = data;
        }

        if(staffIds.length) {
            let responseSheetSummary = await apiGetListSheetSummary({ staff_id: staffIds, month, is_admin: 1 })
            if(responseSheetSummary.status) {
                let sheetSummary = responseSheetSummary.data.rows;
                sheetSummary.map(s => {
                    let taskFound = taskReports.find(t => t.staff_id == s.staff_id);
                    if(taskFound) {
                        taskFound.working_day = s.working_day
                    }
                })
            }
        }
        this.setState({ loading: false, taskReports });
    }

    /**
     * @render
     */
    render() {
        let { t, baseData: { locations, departments, majors } } = this.props;
        const columns = [
            {
                title: 'No.',
                render: r => this.state.taskReports.indexOf(r) + 1
            },
            {
                title: t('Staff'),
                render: r => <span><Link to={`/company/daily-task/logdetail/${r.id}`}>{r.staff?.staff_name}</Link> <small><strong>#{r.staff?.code}</strong></small></span>
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
                title: t('Status'),
                render: r => status.find(s => s.id == r.status)?.name
            },
            {
                title: t('Finished'),
                render: r => r.status == 2 && <img src={iconChecked} width={30} height={25} />,
                align: 'center'
            },
            {
                title: t('UnFinished'),
                render: r => r.status == 1 && <img src={iconChecked} width={30} height={25} />,
                align: 'center'
            },
            {
                title: t('NotDone'),
                render: r => r.status == 0 && <img src={iconChecked} width={30} height={25} />,
                align: 'center'
            },
            {
                title: t('Count Daily Task'),
                render: r => r?.count_daily_task,
                align: 'center'
            },
            {
                title: t('Working days'),
                render: r => typeof r.working_day != 'undefined' && r.working_day,
                align: 'center'
            }
        ];

        return (
            <div>
                <PageHeader
                    title={t('Task Log Report')}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabListTask}></Tab>
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        onFinish={this.submitForm.bind(this)}
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem>
                                    <Input disabled value={this.state.task?.name} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="indate" >
                                    <DatePicker format={dateFormat} placeholder="-- Date --" style={{ width: '100%' }} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="location_id" >
                                    <Dropdown datas={locations} defaultOption="-- All Locations --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} key='submit'>
                                <FormItem>
                                    <Button type="primary" htmlType="submit">
                                        {t('Search')}
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
                                       dataSource={this.state.taskReports ? this.state.taskReports : []}
                                       columns={columns}
                                       loading={this.state.loading}
                                       pagination={false}
                                       rowKey={(taskReport) => taskReport.id}
                                    />
                                </div>
                            </div>
                            :
                            <Table
                                dataSource={this.state.taskReports ? this.state.taskReports : []}
                                columns={columns}
                                loading={this.state.loading}
                                pagination={false}
                                rowKey={(taskReport) => taskReport.id}
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
