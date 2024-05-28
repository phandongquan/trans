import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Input, Form, Popconfirm } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faPlus, faChartBar, faList } from '@fortawesome/free-solid-svg-icons';
import { getList as getListTask, destroy as deleteTask } from '~/apis/company/task';
import { skillStatus, dailyChecklistType, scheduleList } from '~/constants/basic';
import { Link } from 'react-router-dom';
import Dropdown from '~/components/Base/Dropdown';
import { parseIntegertoTime, historyParams, historyReplace, checkPermission } from '~/services/helper';
import { showNotify } from '~/services/helper';
import DeleteButton from '~/components/Base/DeleteButton';
import Tab from '~/components/Base/Tab';
import tabListTask from '~/scenes/Company/DailyTask/config/tabList';
import CreateUpdateDate from '~/components/Base/CreateUpdateDate';
import {screenResponsive} from '~/constants/basic';
const FormItem = Form.Item;

class Task extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        let params = historyParams();
        this.state = {
            loading: false,
            tasks: [],
            limit: 20,
            page: params.page ? Number(params.page) : 1,
            total: 0,
        };
        this.formRef = React.createRef();
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        let params = historyParams();
        this.formRef.current.setFieldsValue(params);
        let values = this.formRef.current.getFieldsValue();
        this.getTask(values);
    }

    /**
     * @event submit form
     * @param {Object} values 
     */
    submitForm = (values) => {
        this.setState({ page: 1 }, () => this.getTask(values));
    }

    /**
     * Get list staff
     * @param {} params 
     */
    getTask = (params = {}) => {
        this.setState({ loading: true });
        params = {
            ...params,
            offset: (this.state.page - 1) * this.state.limit,
            limit: this.state.limit,
        }
        historyReplace(params);
        let xhr = getListTask(params);
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                this.setState({
                    tasks: data.rows,
                    loading: false,
                    total: data.total
                });
            }
        });
    }

    /**
     * @event change page
     * 
     * @param {*} page 
     */
     onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getTask({ ...values }));
    }

    /**
     * Delete Task
     * @param {*} e 
     * @param {*} id 
     */
    onDeleteTask = (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = deleteTask(id);
        xhr.then((response) => {
            if (response.status) {
                let values = this.formRef.current.getFieldsValue();
                this.getTask(values);
                showNotify(t('Notification'), t('hr:task_remove'));
            } else {
                showNotify(t('Notification'), response.message);
            }
        }).catch(error => {
            showNotify(t('Notification'), t('hr:server_error'));
        });
    }

    /**
     * @render
     */
    render() {
        let { t, baseData: { departments, divisions, majors, users } } = this.props;
        delete skillStatus[3];
        const columns = [
            {
                title: 'No.',
                render: r => this.state.tasks.indexOf(r) + 1
            },
            {
                title: t('type'),
                render: r => typeof dailyChecklistType[r.type] == 'undefined' ? dailyChecklistType[0] : dailyChecklistType[r.type]
            },
            {
                title: t('code'),
                dataIndex: 'code', 
            },
            {
                title: t('task_name'),
                render: r => <Link to={`/company/daily-task/${r.id}/edit`}>{r.name}</Link>
            },
            {
                title: t('dept') +(' / ') + t('hr:section')+(' / ') + t('major'),
                render: r => {
                    let deparment = departments.find(d => r.department_id == d.id);
                    let deptName = deparment ? deparment.name : 'NA';
                    let division = divisions.find(d => r.division_id == d.id)
                    let divName = division ? division.name : 'NA';
                    let major = majors.find(m => r.major_id == m.id)
                    let majorName = major ? major.name : 'NA';
                    return `${deptName} / ${divName} / ${majorName}`;
                }
            },
            {
                title: t('schedule'),
                render: r => {
                    let schedule = scheduleList.find(d=> r.schedule== d.id);
                    return schedule ? schedule.name : '';
                }
            },
            {
                title: t('status'),
                render: r => typeof skillStatus[r.status] !== 'undefined' ? skillStatus[r.status] : ''
            },
            {
                title: t('date'),
                render: r => <CreateUpdateDate record={r} />
            },
            {
                title: t('action'),
                align: 'center',
                render: r => {
                    return (
                        <div>
                            <Link to={`/company/daily-task/report-log/${r.id}`}>
                                <Button type="primary" size='small' icon={<FontAwesomeIcon icon={faChartBar} />} />
                            </Link>
                            {
                            checkPermission('hr-daily-task-update') ? 
                                <Link to={`/company/daily-task/${r.id}/edit`} style={{ marginLeft: 5, marginRight: 5 }}>
                                    <Button type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />} />
                                </Link>
                                : ''
                            }
                            {
                                checkPermission('hr-daily-task-delete') ? 
                                <DeleteButton onConfirm={(e) => this.onDeleteTask(e, r.id)} />
                                : ''
                            }
                        </div>
                    );
                }
            }
        ];

        return (
            <div>
                <PageHeader
                    title={t('hr:daily_task')}
                    tags={
                        checkPermission('hr-daily-task-create') ?
                        <Link to={`/company/daily-task/create`} key="create-task">
                            <Button key="create-staff" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                &nbsp;{t('add_new')}
                            </Button>
                        </Link> : ''
                    }
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <div id="tab_responsive">
                        <div className='tab_content_mantenance_device'>
                            <Tab tabs={tabListTask(this.props)} />
                        </div>
                    </div>
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="limit" hidden >
                                    <Input />
                                </FormItem>
                                <FormItem name="sort" hidden>
                                    <Input />
                                </FormItem>
                                <FormItem name="offset" hidden>
                                    <Input />
                                </FormItem>
                                <FormItem name="name">
                                    <Input placeholder={t('task_name')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="department_id" >
                                    <Dropdown datas={departments} defaultOption={t('hr:all_department')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="division_id" >
                                    <Dropdown datas={divisions} defaultOption={t('hr:all_divison')}/>
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="major_id" >
                                    <Dropdown datas={majors} defaultOption={t('hr:all_major')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="status" >
                                    <Dropdown datas={skillStatus} defaultOption={t('hr:all_status')} />
                                </FormItem>
                            </Col>
                            <Col span={4} key='submit'>
                                <FormItem>
                                    <Button type="primary" htmlType="submit">
                                        {t('search')}
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
                                        dataSource={this.state.tasks ? this.state.tasks : []}
                                        columns={columns}
                                        loading={this.state.loading}
                                        pagination={{
                                            total: this.state.total,
                                            pageSize: this.state.limit,
                                            hideOnSinglePage: true,
                                            showSizeChanger: false,
                                            current: this.state.page,
                                            onChange: page => this.onChangePage(page)
                                        }}
                                        rowKey={(task) => task.id}
                                    />
                                </div>
                            </div>
                            :
                            <Table
                                dataSource={this.state.tasks ? this.state.tasks : []}
                                columns={columns}
                                loading={this.state.loading}
                                pagination={{
                                    total: this.state.total,
                                    pageSize: this.state.limit,
                                    hideOnSinglePage: true,
                                    showSizeChanger: false,
                                    current: this.state.page,
                                    onChange: page => this.onChangePage(page)
                                }}
                                rowKey={(task) => task.id}
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Task));
