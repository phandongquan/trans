import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Input, Form, DatePicker } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { getList as getListTaskReport } from '~/apis/company/task/taskReport';
import { getList as getListTaskLog } from '~/apis/company/task/taskLog';
import Dropdown from '~/components/Base/Dropdown';
import Tab from '~/components/Base/Tab';
import { timeFormatStandard } from '~/services/helper';
import TaskReportChart from '~/scenes/Company/Task/TaskReportChart';
import dayjs from 'dayjs';
import tabListTask from '~/scenes/Company/DailyTask/config/tabList';
import { dateTimeFormat, screenResponsive } from '~/constants/basic';
import { Link } from 'react-router-dom';

const FormItem = Form.Item;
const FormatDate = 'YYYY-MM-DD'

class TaskReport extends Component {
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
            dataTaskLogChart: [],
        };
        this.formRef = React.createRef();
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.formRef.current.setFieldsValue({ date: dayjs() })
        let values = this.formRef.current.getFieldsValue();
        this.getTaskReport(values);
        // this.getTaskLog({ task_id: task_id })
    }

    /**
     * @event submit form
     * @param {Object} values 
     */
    submitForm = (values) => {
        Object.keys(values).map((key) => {
            if (key == 'from_date' || key == 'to_date')
                return values[key] = values[key] != undefined ? timeFormatStandard(values[key], FormatDate) : null
        })
        let { task_id } = this.props.match.params;
        values['task_id'] = task_id
        this.getTaskReport(values);
    }

    /**
     * Get list staff
     * @param {} params 
     */
    getTaskReport = (params = {}) => {
        this.setState({ loading: true });
        let { task_id } = this.props.match.params;
        params = {
            task_id,
            from_date: typeof params.date != 'undefined' ? dayjs(params.date).startOf('day').format(dateTimeFormat) : undefined,
            to_date: typeof params.date != 'undefined' ? dayjs(params.date).endOf('day').format(dateTimeFormat) : undefined,
        }
        delete(params.date);
        let xhr = getListTaskReport(params);
        xhr.then((response) => {
            if (response.code == 200) {
                let { data } = response;
                let unfinish = 0; let finished = 0; let notdone = 0;

                if (data.length > 0) {
                    data.map((item, i) => {
                        unfinish = unfinish + item.unfinish
                        finished = finished + item.finished
                        notdone = notdone + item.notdone
                        item['key'] = i
                    })
                    this.setState({
                        taskReports: data,
                        loading: false,
                        dataTaskReportChart: [
                            { name: 'unfinish', count: unfinish },
                            { name: 'finished', count: finished },
                            { name: 'notdone', count: notdone },
                        ]
                    });
                }
                this.setState({ loading: false });
            }
        });
    }

    getTaskLog = (params = {}) => {
        let xhr = getListTaskLog(params);
        xhr.then((response) => {
            if (response.code == 200) {
                let { data } = response;
                let unfinish = 0; let finished = 0; let notdone = 0;

                if (data.length > 0) {
                    data.map((item) => {
                        switch(item.status){
                            case 0:
                                return notdone++
                            case 1:
                                return unfinish++
                            case 2:
                                return finished++
                            default:
                                    return true;
                        }
                    })
                    this.setState({
                        dataTaskLogChart: [
                            { name: 'unfinish', count: unfinish },
                            { name: 'finished', count: finished },
                            { name: 'notdone', count: notdone },
                        ]
                    });
                }
            }
        });
    }

    /**
     * Redirect task log
     * @param {*} params 
     */
    redirectTaskLog = (status = 'finished', record) => {
        let params = {
            indate: record.indate,
            major_id: record.major_id,
            department_id: record.department_id,
            location_id: record.staff_loc_id,
            division_id: record.division_id
        }
        switch (status) {
            case 'finished':
                params.status = 2; break;
            case 'unfinish':
                params.status = 1; break;
            case 'notdone':
                params.status = 0; break;
            default:
                break;
        }
        this.props.history.push({ pathname: `/company/daily-task/log/${record.task_id}`, state: params } )
    }

    /**
     * @render
     */
    render() {
        let { t, match, baseData: { departments, divisions, majors, locations, positions } } = this.props;

        const columns = [
            {
                title: t('Section'),
                dataIndex: 'staff_loc_id',
                render: (staff_loc_id) => {
                    let result = 'NA'
                    locations.map((location) => {
                        if (staff_loc_id == location.id)
                            result = `${location.name}`;
                    })
                    return result;
                }
            },
            {
                title: t('Department'),
                dataIndex: 'department_id',
                render: (department_id) => {
                    let result = 'NA'
                    departments.map((department) => {
                        if (department_id == department.id)
                            result = `${department.name}`;
                    })
                    return result;
                }
            },
            {
                title: t('Devision'),
                dataIndex: 'devision_id',
                render: (division_id) => {
                    let result = 'NA'
                    divisions.map((division) => {
                        if (division_id == division.id)
                            result = `${division.name}`;
                    })
                    return result;
                }
            },
            {
                title: t('Major'),
                dataIndex: 'major_id',
                render: (major_id) => {
                    let result = 'NA'
                    majors.map((major) => {
                        if (major_id == major.id)
                            result = `${major.name}`;
                    })
                    return result;
                }
            },
            {
                title: t('Date'),
                dataIndex: 'indate'
            },
            {
                title: t('Finished'),
                render: r => <Button type='link' onClick={() => this.redirectTaskLog('finished', r)}>{r.finished}</Button>
            },
            {
                title: t('UnFinished'),
                render: r => <Button type='link' onClick={() => this.redirectTaskLog('unfinish', r)}>{r.unfinish}</Button>
            },
            {
                title: t('NotDone'),
                render: r => <Button type='link' onClick={() => this.redirectTaskLog('notdone', r)}>{r.notdone}</Button>
            }
        ];

        return (
            <div>
                <PageHeader
                    title={t('Task Report')}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabListTask}></Tab>
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                <FormItem name="date" >
                                    <DatePicker format={FormatDate} placeholder="To date" style={{ width: '100%' }} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                <FormItem name="department_id" >
                                    <Dropdown datas={departments} defaultOption="-- All Department --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                <FormItem name="devision_id" >
                                    <Dropdown datas={divisions} defaultOption="-- All Devision --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                <FormItem name="major_id" >
                                    <Dropdown datas={majors} defaultOption="-- All Major --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}  key='submit'>
                                <FormItem>
                                    <Button type="primary" htmlType="submit">
                                        {t('Search')}
                                    </Button>
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </Row>

                {/* <Row gutter={[16, 24]}>
                    <Col span={12}>
                        <TaskReportChart
                            datas={this.state.dataTaskReportChart}
                            title='Task Report Status' />
                    </Col>
                    <Col span={12}>
                        <TaskReportChart 
                            datas={this.state.dataTaskLogChart}
                            title='Task Report Log' />
                    </Col>
                </Row> */}

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
                                    />
                                </div>
                            </div>
                            :
                            <Table
                                dataSource={this.state.taskReports ? this.state.taskReports : []}
                                columns={columns}
                                loading={this.state.loading}
                                pagination={false}
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TaskReport));
