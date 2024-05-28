import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Menu, Badge, Dropdown } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { getMyTasks as apiGetMyTasks } from '~/apis/company/project';
import { timeFormatStandard } from '~/services/helper';
import Tab from '~/components/Base/Tab';
import tabList from '~/scenes/Company/config/tabListProject';
import { projectTaskStatus, colorProjectTaskStatus } from '~/constants/basic';
import { save as saveProjectTask } from '~/apis/company/project/task';
import { showNotify } from '~/services/helper';
import { CaretLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import FormModal from '~/components/Company/Project/FormModal';

const FormatDate = 'HH:mm DD/MM/YY ';
class MyTasks extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            visible: false, // Modal visible
            tasks: {},
            taskId: 0,
            projectId: 0
        };
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getMyTasks();
    }

    /**
     * Get list my tasks
     * @param {} params 
     */
    async getMyTasks(params = {}) {
        this.setState({ loading: true });
        let response = await apiGetMyTasks(params);
        if (response.status) {
            let { data } = response;
            this.setState({
                loading: false,
                tasks: data,
            });
        }
    }

    /**
     * @event clickCreate - Update task
     * @param {*} task 
     */
    onShowDetailTask(e, task = null) {
        e.preventDefault();
        if (task) {
            if (this.state.taskId === task.id) {
                this.toggleModal(true);
            } else {
                this.setState({ 
                    taskId: task ? task.id : 0,
                    projectId: task ? task.project.id : 0
                });
            }
        } else {
            this.setState({ taskId: 0, projectId: 0 }, () => this.toggleModal(true));
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
     * @event change task status
     * 
     * @param {*} e 
     * @param {*} task 
     */
    async changeTaskStatus(e, task, status) {
        e.stopPropagation();
        let { t, match } = this.props;
        let data = {
            action: 'attr',
            field: 'status',
            value: status
        }
        let response = await saveProjectTask(task.project.id, task.id, data)
        if (response.status == 1) {
            this.getMyTasks();
            showNotify(t('Notification'), t('Data has been updated!'));
        }
    }

    /**
     * Render status dropdown list
     */
    renderDropdownList(task) {
        let statusList = [];

        let arrStatus = [];
        Object.entries(projectTaskStatus).slice(1,3).map(status => {
            arrStatus.push({ key:  status[0], name: status[1]})
        })

        arrStatus.map(status => {
            let color = colorProjectTaskStatus[status.key];
            statusList.push(
                <Menu.Item key={status.name}>
                    <a onClick={(e) => this.changeTaskStatus(e, task, status.key)}>
                        <Badge color={color} text={status.name} />
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
        let { t } = this.props;
        let { tasks } = this.state;
        let taskList = [];
        Object.keys(tasks).map(key => {
            if(tasks[key] && tasks[key].length > 0){
                taskList.push(
                    <tr key={key}>
                        <td key={key} className="text-left"><h5>{key}</h5></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                )
                tasks[key].map(task => {
                    taskList.push(
                        <tr key={task.id}>
                            <td className="text-left">
                                { this.renderDropdownList(task)}
                                <Link to="" onClick={(e) => this.onShowDetailTask(e, task)}>{ task.name }</Link>
                                { task.parent ? <small> <CaretLeftOutlined /> {task.parent.name} </small> : []}
                                { task.project ? <small> <CaretLeftOutlined /> {task.project.name} </small> : []}
                            </td>
                            <td className="text-center">{task.piority_text}</td>
                            <td className="text-center">{ timeFormatStandard(task.date_end, FormatDate) }</td>
                            <td className="text-center">{task.kpi}</td>
                        </tr>
                    )
                })
            }
        })
        return (
            <>
                <PageHeader title={t('My Tasks')} />
                <Row className='card pl-3 pr-3 mb-3'>
                    <Tab tabs={tabList}></Tab>
                    <table className="table table-striped project-task mt-3">
                        <thead>
                            <tr>
                                <th scope="col" key="task">{t('Task')}</th>
                                <th scope="col" key="piority" style={{ textAlign: 'center' }} width='10%'>{t('Piority')}</th>
                                <th scope="col" key="deadline" style={{ textAlign: 'center' }} width='10%'>{t('Deadline')}</th>
                                <th scope="col" key="score" style={{ textAlign: 'center' }} width='10%'>{t('Score')}</th>
                            </tr>
                        </thead>
                        <tbody> 
                            {taskList} 
                        </tbody>
                    </table>
                </Row>
                <FormModal 
                    visible={this.state.visible} 
                    toggleModal={this.toggleModal.bind(this)} 
                    projectId={this.state.projectId} 
                    id={this.state.taskId} 
                    refreshTask={this.getMyTasks.bind(this)} 
                />
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

export default connect(mapStateToProps)(withTranslation()(MyTasks));
