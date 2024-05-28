import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Col, Form, Input, Row, Table, Button, Popconfirm } from 'antd'
import { PageHeader } from '@ant-design/pro-layout';
import { getList as apiGetList, destroy as apiDelete , apiDuplicateTask } from '~/apis/company/dailyTask/workflow'
import { skillStatus, screenResponsive, checklistStatus, checklistStatus1} from '~/constants/basic'
import { checkPermission, parseIntegertoTime, showNotify } from '~/services/helper'
import { Link } from 'react-router-dom'
import Tab from '~/components/Base/Tab';
import tabList from '../config/tabList'
import Dropdown from '~/components/Base/Dropdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faPen, faTrash ,faClone } from '@fortawesome/free-solid-svg-icons';
import { QuestionCircleOutlined } from '@ant-design/icons'

export class WorkflowDailyTask extends Component {

    constructor(props) {
        super(props)
        this.formRef = React.createRef()
        this.state = {
            loading: false,
            workflows: [],
            limit: 30,
            page: 1,
            total: 0
        }
    }

    componentDidMount() {
        this.getListWorkflow()
    }

    /**
     * Get list workflow
     */
    getListWorkflow = async (params = {}) => {
        this.setState({ loading: true })
        params.limit = this.state.limit
        params.offset = (this.state.page - 1) * this.state.limit
        let response = await apiGetList(params);
        this.setState({ loading: false })
        if(response.status) {
            this.setState({ workflows: response.data.rows, total: response.data.total })
        }
    }

    /**
     * @event submit form
     * @param {Object} values 
     */
     submitForm = (values) => {
        this.setState({ page: 1 }, () => this.getListWorkflow(values));
    }

    /**
     * @event change page
     * 
     * @param {*} page 
     */
     onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getListWorkflow({ ...values }));
    }

    /**
     * Delete Workflow
     * @param {*} e 
     * @param {*} id 
     */
     onDeleteWorkflow = (e, id) => {
        const {t} = this.props;
        e.stopPropagation();
        let xhr = apiDelete(id);
        xhr.then((response) => {
            if (response.status) {
                this.getListWorkflow();
                showNotify('Notification', t('wf_remove'));
            } else {
                showNotify('Notification', response.message);
            }
        }).catch(error => {
            showNotify('Notification', t('server_error'), 'error');
        });
    }
    duplicateTask(id){
        let xhr = apiDuplicateTask(id)
        xhr.then(res => {
            if(res.status){
                showNotify('Notification', 'Duplicate success !')
                let values = this.formRef.current.getFieldsValue();
                this.getListWorkflow({ ...values })
            }
        })
        xhr.catch(err => console.log(err))
    }
    render() {
        let { workflows } = this.state;
        const {t, baseData: { departments } } = this.props;

        const columns = [
            {
                title: 'No.',
                render: r => workflows.indexOf(r) + 1
            },
            {
                title: t('code'),
                dataIndex: "code"
            },
            {
                title: t('name'),
                render: r => <Link to={`/company/daily-task/workflow/${r.id}/edit`}>{r.name}</Link>
            },
            {
                title: t('dept'),
                render: r => departments.find(d => d.id == r.department_id)?.name 
            },
            {
                title: t('status'),
                // render: r => skillStatus[r.status]
                render: r => checklistStatus[r.status]
                
            },
            {
                title: t('date'),
                render: r => {
                    return <div>
                        {r.created_at ? 
                            <small><strong>Created:</strong> {parseIntegertoTime(r.created_at) }</small>
                        : ''}
                        <br />
                        { r.updated_at ? 
                            <small><strong>Updated:</strong> {r.updated_at ? parseIntegertoTime(r.updated_at) : ''}</small>
                        : ''}
                    </div>
                } 
            },
            // {
            //     title: 'Date',
            //     render: r => (
            //         <>
            //         {}
            //         </>
            //     )

            // },
            {
                title: t('action'),
                render: r => {
                    return (
                        <div>
                            <Button type="primary" title='Duplicate' size='small' icon={<FontAwesomeIcon icon={faClone}/>} onClick={() => this.duplicateTask(r.id)}/>
                            {
                                checkPermission('hr-daily-task-checklist-update') ? 
                                    <Link to={`/company/daily-task/workflow/${r.id}/edit`} title='Edit' style={{ marginLeft: 5 }}>
                                        <Button type="primary" size='small'
                                            icon={<FontAwesomeIcon icon={faPen} />}>
                                        </Button>
                                    </Link>
                                : ''
                            }
                            <Popconfirm title={t('hr:confirm_delete')}
                                placement="topLeft"
                                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                onConfirm={(e) => this.onDeleteWorkflow(e, r.id)}
                            >
                            {
                                    checkPermission('hr-daily-task-checklist-delete') ? 
                                        <Button
                                            title={t("delete")}
                                            type="primary"
                                            size='small'
                                            style={{ marginLeft: 5 }}
                                            onClick={e => e.stopPropagation()}
                                            icon={<FontAwesomeIcon icon={faTrash} />}>
                                        </Button>
                                    : ''
                            }
                                
                            </Popconfirm>
                        </div>
                    )
                }
            }
        ]
        return (
            <>
                <PageHeader title={t('daily_checklist')} 
                    tags={[
                        checkPermission('hr-daily-task-checklist-create') ?
                        <Link to={`/company/daily-task/workflow/create`} key="create-workflow" className='mr-2' >
                            <Button key="create-staff" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                {t('add_new')}
                            </Button>
                        </Link>
                        : ''
                    ]}
                />   
                <Row className="card pl-3 pr-3 mb-3">
                    <div id="tab_responsive">
                        <div className='tab_content_mantenance_device'>
                            <Tab tabs={tabList(this.props)} />
                        </div>
                    </div>
                    <Form 
                        className="pt-3"
                        ref={this.formRef}
                        onFinish={this.submitForm.bind(this)}
                    >
                        <Row gutter={24}>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <Form.Item name='name'>
                                    <Input placeholder= {t('name')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name='department_id'>
                                    <Dropdown datas={departments} defaultOption= {t('hr:all_department')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name='status'>
                                    <Dropdown datas={checklistStatus} defaultOption={t('hr:all_status')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" className='mr-2'
                                        icon={<FontAwesomeIcon icon={faSearch} />}>
                                        {t('search')}
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                {window.innerWidth < screenResponsive  ? 
                    <div className='block_scroll_data_table'>
                        <div className='main_scroll_table'> 
                            <Table
                                 loading={this.state.loading}
                                 dataSource={workflows}
                                 columns={columns}
                                 rowKey='id'
                                 pagination={{
                                     total: this.state.total,
                                     pageSize: this.state.limit,
                                     hideOnSinglePage: true,
                                     showSizeChanger: false,
                                     current: this.state.page,
                                     onChange: page => this.onChangePage(page)
                                 }}
                            />
                        </div>
                    </div>
                    :
                    <Table
                        loading={this.state.loading}
                        dataSource={workflows}
                        columns={columns}
                        rowKey='id'
                        pagination={{
                            total: this.state.total,
                            pageSize: this.state.limit,
                            hideOnSinglePage: true,
                            showSizeChanger: false,
                            current: this.state.page,
                            onChange: page => this.onChangePage(page)
                        }}
                    />
                }
            </>
        )
    }
}

const mapStateToProps = (state) => ({
    baseData: state.baseData
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowDailyTask)
