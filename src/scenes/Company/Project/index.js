import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Form, Input, Progress, Modal } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser, faTimes, faCheck, faPen, faEye } from '@fortawesome/free-solid-svg-icons';
import { getList as getProjectList } from '~/apis/company/project';
import { Link } from 'react-router-dom';
import { uniqueId } from 'lodash';
import { timeFormatStandard } from '~/services/helper';
import Tab from '~/components/Base/Tab';
import Dropdown from '~/components/Base/Dropdown';
import StaffDropdown from '~/components/Base/StaffDropdown';
import { create as apiCreate, update as apiUpdate } from '~/apis/company/project';
import { projectStatus } from '~/constants/basic';
import TooltipButton from '~/components/Base/TooltipButton';
import tabList from '../config/tabListProject';
import { showNotify } from '~/services/helper';


const FormItem = Form.Item;
const FormatDate = 'HH:mm DD/MM/YY ';
const { TextArea } = Input;

class Project extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            reFetchData: false,
            staffs: [],
            visible: false, // toogle modal
            projects: []
        };

        this.formRef = React.createRef();
        this.modalFormRef = React.createRef();
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getProjects();
    }

    /**
     * Get list project
     * @param {} params 
     */
    async getProjects(params = {}) {
        this.setState({ loading: true });
        params = {
            ...params,
            status: -1
        }
        let response = await getProjectList(params);
        if (response.status) {
            let { data } = response;
            this.setState({
                loading: false,
                projects: data.rows,
            });
        }
    }

    /**
     * @event submit form
     * @param {Object} values 
     */
    submitForm = (values) => {
        this.getProjects(values);
    }

    /**
     * @event toggle modal
     * @param {*} visible 
     */
    toggleModal(visible) {
        this.setState({ visible });
    }

    /**
     * @vent click edit project
     * @param {*} id 
     */
    onShowModal(id) {
        this.toggleModal(true);
        if (!id) {
            this.modalFormRef.current.resetFields();
        } else {
            let projects = this.state.projects.slice();
            let data = projects.find(r => r.id == id);
            if (data) {
                let assignStaffs = data.main_assign;
                let assignValues = [];
                if (Array.isArray(assignStaffs) && assignStaffs.length) {
                    assignStaffs.map(a => assignValues.push(String(a.staff_id)));
                }
                this.modalFormRef.current.setFieldsValue({
                    ...data,
                    assign_staff: assignValues
                });
            }
        }
    }

    /**
     * @event cancel modal edit project
     */
    handleCancelForm() {
        this.modalFormRef.current.setFieldsValue({ assign_staff: [] });
        this.toggleModal(false);
    }

    /**
     * @event submit form edit project
     */
    submitModal() {
        this.modalFormRef.current.validateFields()
            .then(values => this.saveProject(values))
            .catch((info) => console.log('Validate Failed:', info));
    }

    /**
     * @vent click edit project
     * @param {Object} values 
     */
    async saveProject(values) {
        let { t } = this.props
        let response;
        let message = '';
        if (values['id']) {
            response = await apiUpdate(values['id'], values);
            message = t('Project updated!');
        } else {
            response = await apiCreate(values);
            message = t('Project created!');
        }
        if (response.status == 1) {
            if (values['id']) {
                let project = response.data;
                let projects = this.state.projects.slice();

                let index = projects.indexOf(projects.find(p => p.id == project.id));
                projects[index] = project;

                showNotify(t('Notification'), message);
                this.setState({ projects });
            } else {
                showNotify(t('Notification'), message);
                this.getProjects();
            }
            this.toggleModal(false);
        } else {
            showNotify(t('Notification'), response.message, 'error');
        }
    }

    /**
     * @render
     */
    render() {
        let { t, baseData: { departments } } = this.props;
        let { projects } = this.state;

        const columns = [
            {
                title: t('Department'),
                render: r => departments.map(d => r.department_id == d.id ? d.name : "")
            },
            {
                title: t('Project'),
                render: r => (
                    <>
                        <Link to={`/company/projects/${r.id}/edit`}>{r.name}</Link><br></br>
                        <small>Created: <strong>{timeFormatStandard(r.created_at, FormatDate)}</strong> by #{r.created_by}</small><br></br>
                        <small>Modified: <strong>{timeFormatStandard(r.updated_at, FormatDate)}</strong> by #{r.updated_by}</small>
                    </>
                )
            },
            {
                title: t('Assign'),
                render: r => {
                    let result = [];
                    let assignStaff = Array.isArray(r.main_assign) ? r.main_assign : [];
                    assignStaff.map(s => result.push(
                        <div key={uniqueId('assign_staff')}><FontAwesomeIcon icon={faUser} /> {typeof s.info !== 'undefined' ? s.info.staff_name : ''}</div>)
                    )
                    return result;
                }
            },
            {
                title: t('Status'),
                dataIndex: 'data',
                render: data => data && (
                    <>
                        {data.task_finished}/{data.task_total} finished
                        <Progress percent={data.task_finished_per} strokeColor={{ from: '#108ee9', to: '#87d068' }} />
                    </>
                )
            },
            {
                title: t('Action'),
                align: 'center',
                render: r => (
                    <>
                        <TooltipButton title={t('Edit')} type="primary" size='small' className="mr-1"
                            onClick={() => this.onShowModal(r.id)}
                            icon={<FontAwesomeIcon icon={faPen} />} />
                        <Link to={`/company/projects/${r.id}/edit`}>
                            <TooltipButton title={t('Edit')} type="primary" size='small'
                                icon={<FontAwesomeIcon icon={faEye} />} />
                        </Link>
                    </>
                )
            }
        ]

        return (
            <>
                <PageHeader title={t('Projects')}
                    tags={[
                        <Button key="create-staff" onClick={() => this.onShowModal()} type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                            &nbsp;{t('Add new')}
                        </Button>
                    ]}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabList}></Tab>
                    <Form ref={this.formRef} className="pt-3" name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={24}>
                            <Col span={8}>
                                <FormItem name="keywords">
                                    <Input placeholder={t('Keywords')} />
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <FormItem name="department_id" >
                                    <Dropdown datas={departments} defaultOption="-- All Department --" />
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <FormItem name="status" >
                                    <Dropdown datas={projectStatus} defaultOption="-- All Status --" defaultZero />
                                </FormItem>
                            </Col>
                            <Col span={4} key='submit'>
                                <Button type="primary" htmlType="submit">
                                    {t('Search')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Table dataSource={projects}
                            columns={columns}
                            loading={this.state.loading}
                            pagination={{ pageSize: 15, hideOnSinglePage: true }}
                            rowKey={(project) => project.id}
                        />
                    </Col>
                </Row>
                <Modal forceRender
                    title={<strong>{t('Project')}</strong>}
                    open={this.state.visible}
                    onCancel={this.handleCancelForm.bind(this)}
                    // cancelText={<FontAwesomeIcon icon={faTimes} />}
                    // cancelButtonProps={{ danger: true }}
                    // okText={<FontAwesomeIcon icon={faCheck} />}
                    okText='Save'
                    onOk={this.submitModal.bind(this)}
                    width='30%'>
                    <Form ref={this.modalFormRef} layout="vertical">
                        <Row>
                            <Col span={24}>
                                <FormItem name="id" hidden >
                                    <Input />
                                </FormItem>
                                <FormItem label={t('Name')} name="name" hasFeedback rules={[{ required: true, message: t('Please input name') }]}>
                                    <Input placeholder="Name" />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <FormItem label={t('Department')} name="department_id">
                                    <Dropdown datas={departments} defaultOption='-- All Departments --' takeZero={false} />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <FormItem label={t('Content')} name="content">
                                    <TextArea rows={3} />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={[12, 0]}>
                            <Col span={24}>
                                <FormItem label={t('Main Assign')} name="assign_staff">
                                    <StaffDropdown mode="multiple" />
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
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

export default connect(mapStateToProps)(withTranslation()(Project));
