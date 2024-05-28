import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import { Button, Row, Col, Divider, Menu, Progress, Badge, Dropdown, Form, Input, DatePicker, Spin, Popover } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { withTranslation } from 'react-i18next';
import { FontAwesomeIcon, } from '@fortawesome/react-fontawesome';
import { faPlus, faUser, faEye, faSearch, faChartLine, faTimes } from '@fortawesome/free-solid-svg-icons';
import { detail as projectDetail } from '~/apis/company/project';
import { getList as getListProjectTask, save as saveProjectTask, destroy as destroyProjectTask } from '~/apis/company/project/task';
import { showNotify, redirect, timeFormatStandard } from '~/services/helper';
import TooltipButton from '~/components/Base/TooltipButton';
import DeleteButton from '~/components/Base/DeleteButton';
import BackButton from '~/components/Base/BackButton';
import dayjs from 'dayjs';
import _ from 'lodash';
import { dateFormat, projectTaskPriority, projectTaskStatus, colorProjectTaskStatus } from '~/constants/basic';
import StaffDropdown from '~/components/Base/StaffDropdown';
import BaseDropdown from '~/components/Base/Dropdown';

import Tab from '~/components/Base/Tab';
import tabConfig from './config/tab';
import './config/ProjectDetail.css';
import FormModal from '~/components/Company/Project/FormModal';

class ProjectDetail extends Component {

    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.searchFormRef = React.createRef();
        let qS = this.getQueryString();
        this.state = {
            loading: false,
            visible: false, // Modal visible
            project: {},
            permission: {},
            is_owner: false,
            searchFormValues: qS,
            tasks: [],
            id: 0 // Default task id
        };
    }

    /**
     * Format query string from URL
     * @returns 
     */
    getQueryString() {
        let { keywords, piority, status, staff_id, date_start, date_end, ...query_params } = queryString.parse(window.location.search);
        if (staff_id && !Array.isArray(staff_id)) {
            staff_id = [staff_id];
        }
        if (date_start) {
            date_start = dayjs(date_start);
        }
        if (date_end) {
            date_end = dayjs(date_end);
        }

        return { keywords, piority, status, staff_id, date_start, date_end };
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.refreshDetail();

        if (this.props.location.search) {
            let task_id = this.props.location.search.split('?task_id=')[1];
            if (task_id) {
                this.setState({ id: task_id })
                this.toggleModal(true);
            }
        }
    }


    /**
     * Check permission
     * @param {*} per 
     * @returns 
     */
    checkPermission(per) {
        return this.state.is_owner || (this.state.permission && this.state.permission[per] != 0);
    }

    /**
     * Refresh
     */
    refreshDetail() {
        this.getDetail();
        this.submitSearchForm(this.state.searchFormValues);
        this.toggleModal(false);
    }

    /**
     * Get project detail
     */
    async getDetail() {
        let { id } = this.props.match.params;
        if (id) {
            let response = await projectDetail(id);
            if (response.status) {
                let project = response.data;
                let { permission = {}, is_owner = false } = project;
                this.setState({ project, permission, is_owner });
            }
        }
    }

    /**
     * Get project task list
     */
    async getTasks(params = {}) {
        let { id } = this.props.match.params;
        let submitParams = {};
        if (!params['status']) { submitParams['status'] = -1 };
        if (!params['piority']) { submitParams['piority'] = -1 };
        if (id) {
            this.setState({ loading: true });
            let response = await getListProjectTask(id, { ...params, ...submitParams });
            if (response.status) {
                let tasks = response.data.rows;
                this.setState({ tasks });
            }
            this.setState({ loading: false });
        }
    }

    /**
     * @event search Form
     * @param {*} values 
     */
    submitSearchForm(values) {
        let data = { ...values };
        if (values['date_start']) {
            data['date_start'] = values['date_start'].format('YYYY-MM-DD');
        }
        if (values['date_end']) {
            data['date_end'] = values['date_end'].format('YYYY-MM-DD');
        }

        this.props.history.replace(window.location.pathname + '?' + queryString.stringify(data));
        this.setState({ searchFormValues: values }, () => this.getTasks(data));
    }

    /**
     * @event clickCreate - Update task
     * @param {*} task 
     */
    onEditTask(id = null) {
        if (id) {
            if (this.state.id === id) {
                this.toggleModal(true);
            } else {
                this.setState({ id });
            }
        } else {
            this.setState({ id: 0 }, () => this.toggleModal(true));
        }
    }

    /**
     * @event change task status
     * 
     * @param {*} e 
     * @param {*} task 
     */
    async changeTaskStatus(e, task, status) {
        e.stopPropagation();
        let { t, match } = this.props;
        let projectId = match.params.id;
        let data = {
            action: 'attr',
            field: 'status',
            value: status
        }
        let response = await saveProjectTask(projectId, task.id, data)
        if (response.status == 1) {
            this.refreshDetail();
            showNotify(t('Notification'), t('Data has been updated!'));
        }
    }

    /**
     * @event delete task
     * @param {*} task 
     */
    async onDeleteTask(task) {
        let { t, match } = this.props;
        let projectId = match.params.id;
        let id = task.id;
        let response = await destroyProjectTask(projectId, id);
        if (response.status == 1) {
            this.refreshDetail();
            showNotify(t('Notification'), t('Data has been deleted!'));
        }
    }

    /**
     * @event toggle modal
     * @param {*} visible 
     */
    toggleModal(visible) {
        this.setState({ visible });
    }

    /**
     * Render sumary section
     */
    renderSummary() {
        let { project } = this.state;
        if (!Object.keys(project).length) {
            return [];
        }
        let { t } = this.props;
        let { data, main_assign, staff } = project;
        let mainAssign = [];
        let assign = []

        main_assign.map((s, i) => {
            s.info && mainAssign.push(<span className="pl-3" key={`main_assign_${i}`}><br />{`${i + 1}. ${s.info.staff_name}`}</span>);
        });
        staff.map((s, i) => {
            s.info && assign.push(<span className="pl-3" key={`assign_${i}`}><br />{`${i + 1}. ${s.info.staff_name}`}</span>);
        });

        return (
            <>
                <Row className="p-2">
                    {(data !== null && Object.keys(data).length) ? (
                        <>
                            <Col span={9}>
                                {data.task_finished}/{data.task_total} {t('Finished')}
                            </Col>
                            <Col span={15}>
                                <Progress percent={data.task_finished_per} strokeColor={{
                                    from: '#108ee9',
                                    to: '#87d068',
                                }} />
                            </Col>

                            <Col span={8} className="text-center"><Badge color="#52c41a" />{data.task_finished}<br />{t('Finished')}</Col>
                            <Col span={8} className="text-center"><Badge color="#108ee9" />{data.task_processing}<br />{t('Processing')}</Col>
                            <Col span={8} className="text-center"><Badge color="#f50" />{data.task_lated}<br />{t('Lated')}</Col>
                        </>
                    ) : []}
                    <Col span={24} className="p-2">
                        <b>{t('Key Responsible Person')}</b>
                        {mainAssign}
                    </Col>
                    <Col span={24} className="p-2">
                        <b>{t('Other assign')}</b>
                        {assign}
                    </Col>
                </Row>
            </>
        );
    }

    /**
     * render task list
     */
    renderTaskList() {
        let { t } = this.props;
        let tasks = this.state.tasks;
        let taskList = [];
        if (!tasks.length) {
            return taskList;
        }

        /**
         * @sort by parent_id by id
         */
        // let groupTasks = _.groupBy(tasks, 'parent_id');
        // delete groupTasks[0];
        // let sortTasks = _.filter(tasks, ['parent_id', 0]);
        // Object.keys(groupTasks).map(key => {
        //     let childTasks = groupTasks[key];
        //     let parentId = childTasks[0]['parent_id'];
        //     let index = _.findIndex(sortTasks, ['id', parentId]);
        //     if (typeof sortTasks != 'undefined') {
        //         sortTasks.splice(index + 1, 0, ...childTasks);
        //     }
        // });
        let sortTasks = [];
        tasks.map(t => {
            if (!t.parent_id) {
                sortTasks.push(t);
            } else {
                // Find and insert into below parent position (index+1)
                let parentId = t.parent_id;
                let index = _.findIndex(sortTasks, ['id', parentId]);
                if (index != -1) {
                    sortTasks.splice(index + 1, 0, t);
                } else {
                    sortTasks.push(t);
                }
            }
        });

        if (Array.isArray(sortTasks)) {
            sortTasks.map((task, i) => {
                let td = null;
                let staffText = [];
                task.staff && task.staff.map(s => {
                    s.info && staffText.push(<span key={_.uniqueId('icon')}><FontAwesomeIcon icon={faUser} />{` ${s.info.code} - ${s.info.staff_name}`}<br /></span>);
                });
                let existParent = _.find(sortTasks, ['id', task.parent_id]);
                if (task.parent_id && existParent) {
                    td = (<td key={`name_${i}`} className="subtask">{this.renderDropdownList(task)} {task.name}</td>);
                } else {
                    td = (<td key={`name_${i}`}>{task.name}</td>);
                }
                taskList.push(
                    <tr key={`task_list_${i}`}>
                        <td key={`status_id_${i}`} className="text-center" style={{ width: '50px' }} align="center">{task.parent_id && existParent ? '' : this.renderDropdownList(task)}</td>
                        {td}
                        <td key={`priority_${i}`} align="center">{projectTaskPriority[task.piority]}</td>
                        <td key={`date_start_${i}`} align="center">{task.date_start && timeFormatStandard(task.date_start, dateFormat)}</td>
                        <td key={`date_end_${i}`} align="center">{task.date_end && timeFormatStandard(task.date_end, dateFormat)}</td>
                        <td key={`finish_per_${i}`} align="center">{task.finish_per}</td>
                        <td key={`staff_${i}`}>{staffText}</td>
                        <td key={`kpi_${i}`} align="center">{task.kpi}</td>
                        <td key={`action_${i}`} align="center">
                            <TooltipButton title={t('Edit')} type="primary" size='small'
                                onClick={() => this.onEditTask(task.id)} icon={<FontAwesomeIcon icon={faEye} />} />
                            {(this.checkPermission('delete_task') && task.status == 0) ? (
                                <DeleteButton className="ml-1"
                                    onConfirm={() => this.onDeleteTask(task)} />
                            ) : []}
                        </td>
                    </tr>
                );
            });
        }

        return (<tbody>{taskList}</tbody>);
    }

    /**
     * Render status dropdown list
     */
    renderDropdownList(task) {
        let statusList = []
        Object.keys(projectTaskStatus).map(key => {
            let color = colorProjectTaskStatus[key];
            statusList.push(
                <Menu.Item key={_.uniqueId('menu_item')}>
                    <a onClick={(e) => this.changeTaskStatus(e, task, key)}>
                        <Badge color={color} text={projectTaskStatus[key]} />
                    </a>
                </Menu.Item>
            );
        });
        const menu = (
            <Menu className="">
                {statusList}
            </Menu>
        );

        return (
            <Dropdown menu={menu} className="pl-2">
                <Badge color={colorProjectTaskStatus[task.status]} style={{ cursor: 'pointer' }} />
            </Dropdown>
        );
    }

    /**
    * @render
    */
    render() {
        let { t, match } = this.props;
        let id = match.params.id;
        const searchDropdown = (
            <Form name="searchTaskForm" preserve={false} initialValues={this.state.searchFormValues}
                ref={this.searchFormRef} layout="vertical"
                onFinish={this.submitSearchForm.bind(this)}
            >
                <Row gutter={[12, 0]} style={{ width: '350px' }}>
                    <Col span={24}>
                        <Form.Item label={<b>{t('Key words')}</b>} name="keywords">
                            <Input placeholder={t('Key words')} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label={<b>{t('Assign Staff')}</b>} name="staff_id">
                            <StaffDropdown defaultOption={t('Assign')} mode='multiple'
                                initial={this.state.searchFormValues.staff_id ? true : false}
                                value={this.state.searchFormValues.staff_id ? this.state.searchFormValues.staff_id : []} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={<b>{t('Date Start')}</b>} name="date_start">
                            <DatePicker placeholder={t('Date start')} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={<b>{t('Date End')}</b>} name="date_end">
                            <DatePicker placeholder={t('Date End')} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={<b>{t('Priority')}</b>} name="piority">
                            <BaseDropdown datas={projectTaskPriority} defaultOption="-- Priority --" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={<b>{t('Status')}</b>} name="status">
                            <BaseDropdown datas={projectTaskStatus} defaultOption="-- Status --" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Button type="primary" icon={<FontAwesomeIcon icon={faSearch} />} htmlType="submit">
                            &nbsp;{t('Search')}
                        </Button>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                        <Button type="warning" icon={<FontAwesomeIcon icon={faTimes} />} onClick={() => this.submitSearchForm({})}>
                            &nbsp;{t('Reset')}
                        </Button>
                    </Col>
                </Row>
            </Form>

        );

        return (<>
            <PageHeader title={this.state.project.name || t('Update Project')} />
            <Row className="card p-3 mb-3 pt-0" key={_.uniqueId('row')}>
                <Tab tabs={tabConfig(id, this.state.project.is_owner)} />
            </Row>
            <Row key={_.uniqueId('row')}>
                <Col span={18} className='pr-3'>
                    <Row className='card mr-1 p-3 pt-0'>
                        <PageHeader title={t('Task List')} className="p-1" key={_.uniqueId('ph')}
                            extra={[
                                <Popover key={_.uniqueId('popover')} content={searchDropdown} trigger={['click']}                                >
                                    <TooltipButton key={_.uniqueId('ph-tag')} type="link" size='small' title='Click to open search' icon={<FontAwesomeIcon icon={faSearch} />} />
                                </Popover>,
                                <Link to={`/company/projects/detailgantt/${id}`} key={_.uniqueId('extra_link')}>
                                    <TooltipButton key={_.uniqueId('ph-tag')} type="link" size='small' icon={<FontAwesomeIcon icon={faChartLine} />} />
                                </Link>
                            ]}
                            tags={[
                                this.checkPermission('add_task') &&
                                <Button key="create-project-task" onClick={() => this.onEditTask()} type="link" icon={<FontAwesomeIcon icon={faPlus} />}>
                                    &nbsp;{t('Add Task')}
                                </Button>
                            ]}
                        />
                        <div>
                            <Spin spinning={this.state.loading}>
                                <table className="table table-striped project-task ant-table-wrapper">
                                    <thead>
                                        <tr>
                                            <th scope="col" key="status"></th>
                                            <th scope="col" key="name">Task</th>
                                            <th scope="col" key="piority" style={{ textAlign: 'center' }}>Priority</th>
                                            <th scope="col" key="date_start" style={{ textAlign: 'center' }}>Start</th>
                                            <th scope="col" key="date_end" style={{ textAlign: 'center' }}>End</th>
                                            <th scope="col" key="finish_per" style={{ textAlign: 'center' }}>%</th>
                                            <th scope="col" key="staff">Assign</th>
                                            <th scope="col" key="kpi" style={{ textAlign: 'center' }}>Score</th>
                                            <th scope="col" key="action" width="100px"></th>
                                        </tr>
                                    </thead>
                                    {this.renderTaskList()}
                                </table>
                            </Spin>
                        </div>
                        <Divider className="p-0 m-0 mb-3" />
                        <Col span={12} className="text-right">
                            <BackButton url={`/company/projects`} />
                        </Col>
                    </Row>
                </Col>
                <Col span={6}>
                    <Row className='card p-3 pt-0'>
                        <PageHeader title={t('Summary')} className="p-0" />
                        <Divider className="p-0 m-0" />
                        {this.renderSummary()}
                    </Row>
                </Col>
            </Row>
            <FormModal visible={this.state.visible} toggleModal={this.toggleModal.bind(this)}
                projectId={id}
                id={this.state.id}
                is_owner={this.state.is_owner}
                permission={this.state.permission}
                refreshTask={this.refreshDetail.bind(this)} />
        </>);
    }
}
/**
 * Map redux state to component props
 * @param {Object} state
 */
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    }
}
export default connect(mapStateToProps)(withTranslation()(ProjectDetail));