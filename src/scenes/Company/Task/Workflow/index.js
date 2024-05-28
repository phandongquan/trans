import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Form, Popconfirm, Input, Tabs, DatePicker } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faPlus, faTrash, faClone, faLink } from '@fortawesome/free-solid-svg-icons';
import { getList as getListWorkflow, destroy as deleteWorkflow, duplicate, reportWorkflowTasks } from '~/apis/company/workflow';
import { Link } from 'react-router-dom';
import { checkPermission, exportToXLS } from '~/services/helper';
import { showNotify } from '~/services/helper';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Tab from '~/components/Base/Tab';
import tabListTask from '../../config/tabListTask';
import Dropdown from '~/components/Base/Dropdown';
import { typesTaskWorkflows, workflowStatus, screenResponsive, dateTimeFormat, TASK_STATUS_FINISHED, TASK_STATUS_PROCESSING, TASK_STATUS_FAILED } from '~/constants/basic';
import CreateUpdateDate from '~/components/Base/CreateUpdateDate'
import { getListCategory } from '~/apis/company/workflow/ConfigCategory';
import dayjs from 'dayjs';
import AnyChart from 'anychart-react'
import './config/workflow.css'
import * as XLSX from 'xlsx';
const workplace = 'https://work.hasaki.vn'

export const header = {
    'workflow_id': 'Workflow ID',
    'name': 'Workflow Name',
    'code': 'Code',
    'total_none_assign': 'Total None Assign',
    'total_task': 'Total Task',
    'total_none': 'Total None',
    'total_processing': 'Total Processing',
    'total_completed': 'Total Completed',
    'total_canceled': 'Total Canceled',
    'total_waiting_approve': 'Total Waiting Approve',
    'total_failed': 'Total Failed',
    'link': 'Link'
}

function formatHeader() {
    let headers = []
    Object.keys(header).map((key, i) => {
        headers.push(header[key]);
    });
    return [headers];
}

function formatData(datas) {
    const result = datas.map(d => {
        let row = []
        Object.keys(header).map(key => {
            row.push(d[key]);
        })

        return row
    })

    return result;
}

class Workflow extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.assginStaffRef = null;
        this.state = {
            loading: false,
            workflows: [],
            categories: [],
            reportWorkflowTasks: [],
            currentTab: '1'
        };
        this.formRef = React.createRef();
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getWorkflow();
        this.getListCategory();
        const params = {
            from_date: dayjs().subtract(7, 'day').format(dateTimeFormat),
            to_date: dayjs().format(dateTimeFormat)
        }
        this.getReportWorkflowTasks(params)
    }
    async getListCategory() {
        let response = await getListCategory()
        if (response.status) {
            this.setState({ categories: response.data })
        } else {
            showNotify('Notification', response.message, 'error')
        }
    }

    /**
     * Get list workflows
     * @param {} params 
     */
    getWorkflow = (params = {}) => {
        this.setState({ loading: true });
        if (params.date) {
            params.from_date = dayjs(params.date[0]).format(dateTimeFormat)
            params.to_date = dayjs(params.date[1]).format(dateTimeFormat)
            delete params.date
        }

        params = {
            ...params,
            type: 2,
            limit: 1000
        }


        let xhr = getListWorkflow(params);
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                this.setState({
                    workflows: data.rows,
                    loading: false,
                });
            }
        });
    }

    /**
     * 
     * @param {*} params 
     */
    getReportWorkflowTasks = (params = {}) => {
        if (params.date) {
            params.from_date = dayjs(params.date[0]).format(dateTimeFormat)
            params.to_date = dayjs(params.date[1]).format(dateTimeFormat)
            delete params.date
        }

        let xhr = reportWorkflowTasks(params);
        xhr.then((response) => {
            if (response.status) {
                const { data } = response
                this.setState({
                    reportWorkflowTasks: data
                });
            }
        });
    }

    /**
     * Delete Task
     * @param {*} e 
     * @param {*} id 
     */
    onDeleteWorkflow = (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = deleteWorkflow(id);
        xhr.then((response) => {
            if (response.status) {
                this.getWorkflow();
                showNotify(t('Notification'), t('hr:workflow_has_been_removed!'));
            } else {
                showNotify(t('Notification'), response.message);
            }
        }).catch(error => {
            console.log(error.response);
            showNotify(t('Notification'), t('Server has error!'));
        });;
    }
    /**
     * @event submit form
     * @param {Object} values 
     */
    submitForm = (values) => {
        const { currentTab } = this.state
        if (currentTab == '1') {
            this.getWorkflow(values)
        } else {
            this.getReportWorkflowTasks(values)
        }
    }

    /**
     * Handle assign staff
     */
    handleAssignStaff = workflow => {
        this.assginStaffRef.toggleModal(true, workflow);
    }

    duplicateWorkflow(id) {
        let xhr = duplicate(id)
        xhr.then(res => {
            if (res.status) {
                showNotify('Notification', 'Duplicate workflow successfull!')
                let values = this.formRef?.current?.getFieldsValue();
                this.getWorkflow({ ...values })
            }
        })
        xhr.catch(err => console.log(err))
    }

    /**
     * @render
     */
    render() {
        let { t, baseData: { departments }, currentTab } = this.props;
        let { reportWorkflowTasks } = this.state
        let dataChart = reportWorkflowTasks
            .sort((a, b) => b.total_task - a.total_task)
            .slice(0, 10)
            .map(item => {
                return {
                    x: item.name,
                    value: item.total_task
                }
            })

        const columns = [
            {
                title: 'ID',
                dataIndex: 'id',
            },
            {
                title: t('hr:code'),
                dataIndex: 'code',
            },
            {
                title: t('hr:type'),
                render: r => r?.setting ? typesTaskWorkflows[r.setting] : ''
            },
            {
                title: t('hr:name'),
                dataIndex: 'name',
                render: (text, record, index) => {
                    return <Link to={`/company/workflows/${record.id}/edit`} key={record.id}>{record.name}</Link>
                }
            },
            {
                title: t('hr:status'),
                render: r => typeof workflowStatus[r.status] !== 'undefined' ? workflowStatus[r.status] : ''
            },
            {
                title: t('hr:category'),
                render: r => r?.category?.name
            },
            {
                title: t('hr:date'),
                render: r => <CreateUpdateDate record={r} />,
                width: '15%'
            },
            {
                title: t('hr:action'),
                dataIndex: 'action',
                render: (text, record, index) => {
                    const { created_by_user } = record;
                    const { auth: { profile } } = this.props;
                    const isCreated = profile?.id === created_by_user?.id && record.status === 2;
                    return (
                        <div>
                            {
                                (checkPermission('hr-workflow-update') || isCreated) ?
                                    <Link to={`/company/workflows/${record.id}/edit`} title={t('Edit')}>
                                        <Button type="primary" size='small'
                                            icon={<FontAwesomeIcon icon={faPen} />}>
                                        </Button>
                                    </Link>
                                    : ''
                            }
                            <Popconfirm
                                title={t("are_you_duplicate_workflow?")}
                                onConfirm={(e) => {
                                    this.duplicateWorkflow(record.id)
                                }}
                                // onCancel={cancel}
                                okText="Có"
                                cancelText="Không"
                                placement="topLeft"
                                icon={<QuestionCircleOutlined />}
                            >
                                <Button type="primary" size='small'
                                    icon={<FontAwesomeIcon icon={faClone} />} title={t('hr:duplicate')}
                                    // onClick={() => this.duplicateWorkflow(record.id)}
                                    style={{ marginLeft: 8 }} />
                            </Popconfirm>
                            <Popconfirm title={t('hr:confirm_delete')}
                                placement="topLeft"
                                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                onConfirm={(e) => this.onDeleteWorkflow(e, record.id)}
                            >
                                {
                                    checkPermission('hr-workflow-delete') ?
                                        <Button
                                            type="primary"
                                            size='small'
                                            style={{ marginLeft: 8 }}
                                            onClick={e => e.stopPropagation()}
                                            icon={<FontAwesomeIcon icon={faTrash} />}>
                                        </Button>
                                        : ''
                                }
                            </Popconfirm>
                            <a href={`${workplace}/tasks-workflow?wfid=${record.id}`} target="_blank">
                                <Button
                                    type="primary"
                                    size='small'
                                    style={{ marginLeft: 8 }}
                                    icon={<FontAwesomeIcon icon={faLink} />}>

                                </Button>
                            </a>
                            {/* <Tooltip title={t('Assign Staff')} className='ml-2'>
                                <Button type="primary" size='small'
                                    onClick={() => this.handleAssignStaff(record)}
                                    icon={<FontAwesomeIcon icon={faBars} />}>
                                </Button>
                            </Tooltip> */}
                        </div>
                    );
                }
            }
        ];

        const columnsReport = [
            {
                title: 'No',
                render: (text, record, index) => {
                    return index + 1
                }
            },
            {
                title: t('hr:name'),
                render: (text, record, index) => {
                    return <Link to={`/company/workflows/${record.id}/edit`} key={record.workflow_id}>{record.name}</Link>
                }
            },
            {
                title: t('hr:code'),
                dataIndex: 'code',
            },
            {
                title: t('hr:total_task'),
                render: (text, record, index) => {
                    return <a href={`${workplace}/tasks-workflow?wfid=${record.workflow_id}`} target="_blank">{record.total_task}</a>
                }
            },
            {
                title: t('hr:total_completed'),
                render: (text, record, index) => {
                    return <a href={`${workplace}/tasks-workflow?wfid=${record.workflow_id}&status=${TASK_STATUS_FINISHED}`} target="_blank">{record.total_completed}</a>
                }
            },
            {
                title: t('hr:total_processing'),
                render: (text, record, index) => {
                    return <a href={`${workplace}/tasks-workflow?wfid=${record.workflow_id}&status=${TASK_STATUS_PROCESSING}`} target="_blank">{record.total_processing}</a>
                },
            },
            {
                title: t('hr:total_fail'),
                render: (text, record, index) => {
                    return <a href={`${workplace}/tasks-workflow?wfid=${record.workflow_id}&status=${TASK_STATUS_FAILED}`} target="_blank">{record.total_failed}</a>
                },
            },
            {
                title: t('hr:total_none_assign'),
                render: (text, record, index) => {
                    return <a href={`${workplace}/tasks-workflow?wfid=${record.workflow_id}&no_assign=1`} target="_blank">{record.total_none_assign}</a>
                },
            }
        ]

        return (
            <div id='page_workflow'>
                <PageHeader
                    title={t('hr:workflow')}
                    tags={
                        checkPermission('hr-workflow-create') ?
                            <Link to={`/company/workflows/create`} key="create-task">
                                <Button key="create-staff" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                    {t('add_new')}
                                </Button>
                            </Link>
                            : ''
                    }
                    extra={
                        <Link to={`/company/workflows/config-category`}>
                            {t('hr:config') + t(' ') + t('hr:category')}
                        </Link>
                    }
                />
                <Row className="card pl-3 pr-3 mb-3">
                    {/* <Tab tabs={tabListTask(staff_info?.major_id,checkManager(staff_info?.position_id))}></Tab> */}
                    <div id="tab_responsive">
                        <div className='tab_content_mantenance_device'>
                            <Tab tabs={tabListTask(this.props)}></Tab>
                        </div>
                    </div>

                    <Form ref={this.formRef} className="pt-3" name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <Form.Item name='keywords'>
                                    <Input placeholder={t('hr:code') + ('/') + t('hr:workflow_name')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={3}>
                                <Form.Item name='department_id'>
                                    <Dropdown datas={departments} defaultOption={t('hr:all_department')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={3}>
                                <Form.Item name='category_id'>
                                    <Dropdown datas={this.state.categories} defaultOption={t('hr:all_category')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={3}>
                                <Form.Item name='status'>
                                    <Dropdown datas={workflowStatus} defaultOption={t('hr:all_status')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name='date'>
                                    <DatePicker.RangePicker format={dateTimeFormat} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item>
                                    <Button className='mr-2' type="primary" htmlType="submit">
                                        {t('hr:search')}
                                    </Button>
                                    <Button
                                        type='primary'
                                        onClick={() => {
                                            let { reportWorkflowTasks = [] } = this.state
                                            reportWorkflowTasks = reportWorkflowTasks.map((item, index) => {
                                                return {
                                                    ...item,
                                                    link: `${workplace}/tasks-workflow?wfid=${item.workflow_id}`
                                                }
                                            })
                                            let header = formatHeader();
                                            let rows = formatData(reportWorkflowTasks);
                                            let fileName = `Report-task-workflow-${dayjs().format('YYYY-MM-DD')}`;
                                            let datas = [...header, ...rows];
                                            exportToXLS(fileName, datas);
                                        }}
                                    >
                                        {t('hr:export')}
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row className="card pl-3 pr-3 mb-1">
                    <Tabs
                        defaultActiveKey={currentTab}
                        activeKey={currentTab}
                        items={[
                            {
                                key: '1',
                                label: t('hr:workflow'),
                                children: <Row className='mt-3' gutter={[16, 24]}>
                                    <Col span={24}>
                                        {window.innerWidth < screenResponsive ?
                                            <div className='block_scroll_data_table'>
                                                <div className='main_scroll_table'>
                                                    <Table
                                                        dataSource={this.state.workflows ? this.state.workflows : []}
                                                        columns={columns}
                                                        loading={this.state.loading}
                                                        pagination={{ pageSize: 15 }}
                                                        rowKey={(workflow) => workflow.id}
                                                    />
                                                </div>
                                            </div>
                                            :
                                            <Table
                                                dataSource={this.state.workflows ? this.state.workflows : []}
                                                columns={columns}
                                                loading={this.state.loading}
                                                pagination={{ pageSize: 15 }}
                                                rowKey={(workflow) => workflow.id}
                                                rowClassName={(workflow) => workflow.status == 5 ? 'bg-archive' : ''}
                                            />
                                        }
                                    </Col>
                                </Row>
                            },
                            {
                                key: '2',
                                label: t('hr:report'),
                                children: <Row className='mt-3' gutter={[16, 24]}>
                                    <Col span={24}>
                                        <div id="doughnut_chart">
                                            <AnyChart
                                                type="pie3d"
                                                height={400}
                                                innerRadius="30%"
                                                data={dataChart}
                                                title="Percentages"
                                            />
                                        </div>
                                    </Col>
                                    <Col span={24}>
                                        <Table
                                            dataSource={reportWorkflowTasks ? reportWorkflowTasks : []}
                                            columns={columnsReport}
                                            loading={this.state.loading}
                                            pagination={{ pageSize: 15 }}
                                            rowKey={(workflow) => workflow.id}
                                        />
                                    </Col>
                                </Row>
                            },
                        ]}
                        onChange={(key) => {
                            this.formRef.current.resetFields()
                            if (key == 2) {
                                this.formRef.current.setFieldsValue({
                                    date: [dayjs().subtract(7, 'day'), dayjs()]
                                })
                            }
                            this.setState({ currentTab: key })
                        }}
                    />
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Workflow));
