import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col, Input, Form, Divider } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { withTranslation } from 'react-i18next';
import { FontAwesomeIcon, } from '@fortawesome/react-fontawesome';
import { faSave, faReply, faPlus, faTimes, faUser, faEye, faCheck, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { detail as projectDetail } from '~/apis/company/project';
import { getList as getListProjectTask, save as saveProjectTask, destroy as destroyProjectTask } from '~/apis/company/project/task';
import { showNotify, redirect, timeFormatStandard } from '~/services/helper';
import TooltipButton from '~/components/Base/TooltipButton';
import DeleteButton from '~/components/Base/DeleteButton';
import BackButton from '~/components/Base/BackButton';
import BaseDropdown from '~/components/Base/Dropdown';
import StaffDropdown from '~/components/Base/StaffDropdown';
import _ from 'lodash';
import { dateFormat, projectTaskPriority, projectTaskStatus, colorProjectTaskStatus, projectTaskStartAfter, projectTaskActionRequire } from '~/constants/basic';

import Tab from '~/components/Base/Tab';
import tabConfig from './config/tab';
import './config/ProjectDetail.css';
class ProjectReportTask extends Component {

    constructor(props) {
        super(props);
        this.formRef = React.createRef();

        this.state = {
            loading: false,
            visible: false, // Modal visible
            project: {},
            tasks: [],
            id: 0
        };
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.refreshDetail();
    }

    /**
     * Refresh
     */
    refreshDetail() {
        this.getDetail();
        this.getTasks();
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
                this.setState({ project });
            }
        }
    }

    /**
     * Get project task list
     */
    async getTasks() {
        let { id } = this.props.match.params;
        if (id) {
            let response = await getListProjectTask(id);
            if (response.status) {
                let tasks = response.data.rows;
                this.setState({ tasks });
            }
        }
    }

    /**
     * @event clickCreate - Update task
     * @param {*} task 
     */
    onEditTask(task = null) {
        if (task) {
            if (this.state.id === task.id) {
                this.toggleModal(true);
            } else {
                this.setState({ id: task ? task.id : 0 });
            }
        } else {
            this.setState({ id: 0 }, () => this.toggleModal(true));
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
     * Loading Button
     */
    enterLoading = () => {
        this.setState({ loading: true });
        setTimeout(() => {
            this.setState({ loading: false });
        }, 1000);
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
        let groupTasks = _.groupBy(tasks, 'parent_id');
        let parentTasks = _.get(groupTasks, 0);
        delete groupTasks[0];
        let childGroupTasks = groupTasks;
        let sortTasks = parentTasks;
        Object.keys(childGroupTasks).map(key => {
            let childTasks = childGroupTasks[key];
            let parentId = childTasks[0]['parent_id'];
            let index = _.findIndex(sortTasks, ['id', parentId]);
            sortTasks.splice(index + 1, 0, ...childTasks);
        });

        sortTasks.map((task, i) => {
            let staffText = [];
            task.staff && task.staff.map(s => {
                staffText.push(<span key={_.uniqueId('icon')}><FontAwesomeIcon icon={faUser} />{` ${s.info.code} - ${s.info.staff_name}`}<br /></span>);
            });

            taskList.push(
                <tr key={`task_list_${i}`}>
                    <td key={`priority_${i}`} align="center">{projectTaskPriority[task.piority]}</td>
                    <td key={`date_start_${i}`} align="center">{task.date_start && timeFormatStandard(task.date_start, dateFormat)}</td>
                    <td key={`date_end_${i}`} align="center">{task.date_end && timeFormatStandard(task.date_end, dateFormat)}</td>
                    <td key={`finish_per_${i}`} align="center">{task.finish_per}</td>
                    <td key={`staff_${i}`}>{staffText}</td>
                    <td key={`kpi_${i}`} align="center">{task.kpi}</td>
                    <td key={`action_${i}`} align="center">
                    </td>
                </tr>
            );
        });

        return (<tbody>{taskList}</tbody>);
    }

   
    /**
    * @render
    */
    render() {
        let { t, match } = this.props;
        let id = match.params.id;
        let subTitle;
        if (id) {
            subTitle = t('Update');
        } else {
            subTitle = t('Add New Task');
        }
        return (<>
            <PageHeader title={this.state.project.name || t('Update Project')} />
            <Row className="card p-3 mb-3 pt-0">
                <Tab tabs={tabConfig(id)} />
            </Row>
            <Row >
                <Col span={24}>
                    {/* <Row className='card mr-1 p-3 pt-0'>
                            <PageHeader title={t('Task List')} className="p-0" />
                        </Row> */}
                    <Row className='card mr-1 p-3 pt-0'>
                        <PageHeader title={t('Task List')} className="p-0"
                            extra={[]}
                            tags={[
                                <Button key="create-project-task" onClick={() => this.onEditTask()} type="link" icon={<FontAwesomeIcon icon={faPlus} />}>
                                    &nbsp;{t('Add Task')}
                                </Button>
                            ]}
                        />
                        <table className="table  table-striped project-task">
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
                        <Divider className="p-0 m-0 mb-3" />
                        <Col span={24} className="text-right">
                            <BackButton url={`/company/projects`} />
                        </Col>
                    </Row>
                </Col>             
            </Row>
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
export default connect(mapStateToProps)(withTranslation()(ProjectReportTask));