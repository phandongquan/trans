import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col, Input, Form, Divider, Menu, Dropdown, Modal, DatePicker, List, InputNumber } from "antd";
import { Comment } from '@ant-design/compatible';
import { PageHeader } from '@ant-design/pro-layout';
import { withTranslation } from 'react-i18next';
import { FontAwesomeIcon, } from '@fortawesome/react-fontawesome';
import { faSave, faReply, faPlus, faTimes, faUser, faEye, faCheck, faTrashAlt, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { getList as getListProjectTask, save as saveProjectTask, detail as detailProjectTask, getComment, addComment } from '~/apis/company/project/task';
import { showNotify, redirect, timeFormatStandard } from '~/services/helper';

import BaseDropdown from '~/components/Base/Dropdown';
import StaffDropdown from '~/components/Base/StaffDropdown';
import _, { uniqueId } from 'lodash';
import dayjs from 'dayjs';
import { dateFormat, projectTaskPriority, projectTaskStatus, colorProjectTaskStatus, projectTaskStartAfter, projectTaskActionRequire } from '~/constants/basic';
import Editor from '~/components/Base/Editor';
import { LinkOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './FormModal.css';

class FormModal extends Component {

    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.commentFormRef = React.createRef();

        this.state = {
            tasks: [],
            staffInfos: [],
            defaultStaffs: [],
            defaultSubTaskStaffs: [],
            hiddenStartAfter: false,
            permission: {},
            is_owner: false,
            note: '',
            commentList: [],
        };
    }

    /**
     * @lifecycle
     * @param {*} prevProps 
     */
    componentDidUpdate(prevProps) {
        if (this.state.hiddenStartAfter) {
            if (this.state.tasks.length)
                this.getTasks();
            return false;
        }

        if (prevProps.id !== this.props.id) {
            this.getTask();
            if(this.props.id) {
                getComment({ obj_id: this.props.id }).then((res) => {
                    if (res.status == 1) {
                        this.setState({ commentList: res.data });
                    }
                });
            }
            this.props.toggleModal(true);
        }
        else if (!this.props.id) {
            this.formRef.current.resetFields();
            this.setFormDefaultValues();
        }
    }
    /**
     * @lifecycle
     * @param {*} nextProps 
     */
    componentWillReceiveProps(nextProps) {
        let { permission = {}, is_owner = false } = nextProps;
        this.setState({ permission, is_owner })
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
     * 
     */
    setFormDefaultValues() {
        /**
         * @set form default value
         */
        this.formRef.current.setFieldsValue({
            status: 0,
            note: '',
            start_after: 0,
            piority: 0,
            action_id: 0
        });
    }
    /**
     * Get task detail
     */
    async getTask() {
        let { projectId, id } = this.props;
        let response = await detailProjectTask(projectId, id);
        if (response.status === 1) {
            let task = response.data.detail;
            this.setState({
                hiddenStartAfter: task ? task.start_after : false,
                note: task ? task.note : '',
            })
            let formData = {};
            if (task) {
                Object.keys(task).map(key => {
                    if (['date_start', 'date_end'].includes(key)) {
                        formData[key] = task[key] ? dayjs(task[key]) : null;
                    } else if (key === 'staff') {
                        /**
                         * @format staff assign multiple
                         */
                        let staffs = task[key];
                        let defaultStaffs = [];
                        let assignStaffInfos = [];
                        if (!staffs.length) {
                            formData['assign_staff'] = [];
                            return;
                        }
                        staffs.map(t => {
                            defaultStaffs.push({ id: t.staff_id, name: t.info ? `[${t.info.code}] ${t.info.staff_name}` : `[]` });
                            assignStaffInfos.push(t.staff_id);
                        });
                        this.setState({ defaultStaffs });
                        formData['assign_staff'] = assignStaffInfos;
                    } else if (key === 'subtasks') {
                        /**
                         * @format data for subtasks
                         */
                        let subtasks = task[key];
                        let formatSubtasks = [];
                        let defaultSubTaskStaffs = [];
                        subtasks.map(t => {
                            let assignStaff = t.staff.length ? t.staff[0] : null;
                            if (assignStaff) {
                                defaultSubTaskStaffs.push({ id: assignStaff.staff_id, name: `[${assignStaff.info.code}] ${assignStaff.info.staff_name}` });
                                this.setState({ defaultSubTaskStaffs })
                            }
                            formatSubtasks.push({
                                id: t.id,
                                name: t.name,
                                status: t.status,
                                note: t.note,
                                piority: t.piority,
                                date_start: t.date_start ? dayjs(t.date_start) : null,
                                date_end: t.date_end ? dayjs(t.date_end) : null,
                                assign_staff: assignStaff ? assignStaff.staff_id : null
                            });
                        });
                        formData[key] = formatSubtasks;
                    } else if (key === 'after_task_id') {
                        formData[key] = task[key] ? task[key] : null
                    } else {
                        formData[key] = task[key];
                    }
                });
            }
            this.formRef.current.setFieldsValue(formData);
        }
    }

    /**
     * Get List tasks for field `after_task_id`
     */
    getTasks() {
        let { tasks } = this.state;
        if (!tasks.length && this.props.projectId) {
            let xhr = getListProjectTask(this.props.projectId, { piority: -1, status: -1 })
            xhr.then(response => {
                if (response.status) {
                    let { data } = response;
                    let listOption = [];
                    if (data.rows && typeof data.rows == 'object')
                        data.rows.map(task => listOption.push({ id: task.id, name: task.name }))
                    this.setState({ tasks: listOption })
                }
            })
        }
    }

    onHandleSelectStaffStart = (val) => {
        this.setState({ hiddenStartAfter: val == 1 ? true : false }, () => this.getTasks())
        this.formRef.current.setFieldsValue({ start_after: val })
    }

    /**
     * @event before submit form
     * Validate before submit
     */
    handleFormSubmit() {
        this.formRef.current.validateFields()
            .then((values) => {
                this.submitForm(values);
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }

    /**
     * @event submit taskform
     */
    async submitForm(values) {
        let { t, projectId, id } = this.props;

        /**
         * @format values before submit
         */
        values['date_start'] = values['date_start'] && values['date_start'].format(dateFormat);
        values['date_end'] = values['date_end'] && values['date_end'].format(dateFormat);
        values['note'] = this.state.note;
        if (values['subtasks']) {
            values['subtasks'].map(s => {
                s['id'] = s.id ? s.id : 0;
                s['date_start'] = s['date_start'] && s['date_start'].format(dateFormat);
                s['date_end'] = s['date_end'] && s['date_end'].format(dateFormat);
            });
        }

        let response = await saveProjectTask(projectId, id, values)
        if (response.status == 1) {
            showNotify(t('Notification'), t('Data has been updated!'));
            this.props.refreshTask();
            this.props.toggleModal(false);

        } else {
            showNotify(t('Notification'), response.message, 'error');
        }
    }

    /**
     * @render task comments
     */
    renderTaskComments = () => {
        let { t } = this.props;
        let { TextArea } = Input;
        let data = [];
        if (this.state.commentList.length) {
            this.state.commentList.map((c) => {
                data.push({
                    author: (<strong>{c.user.name}</strong>),
                    datetime: (<span> commented on {dayjs(c.created_at).format('YYYY-MM-DD HH:mm')}</span>),
                    content: (<p>{c.comment}</p>),
                })
            });
        }
        return (
            <Row gutter={[12, 0]}>
                <PageHeader title={t('Comments')} className="p-1" />
                <Col span={24}>
                    <List
                        locale={{ emptyText: <span></span> }}
                        className="comment-list"
                        itemLayout="horizontal"
                        dataSource={data}
                        renderItem={item => (
                            <li>
                                <Comment
                                    author={item.author}
                                    content={item.content}
                                    datetime={item.datetime}
                                />
                            </li>
                        )}
                    />
                </Col>
                {this.checkPermission('comment') ? (
                    <Col span={24}>
                        <Form ref={this.commentFormRef} preserve={false} layout="vertical">
                            <Form.Item label={t('Leave Comment')} name="comment" rules={[{ required: true, message: 'Missing Comment' }]}>
                                <TextArea rows={3} />
                            </Form.Item>
                            <Form.Item>
                                <Button htmlType="submit" onClick={this.onSubmitComment.bind(this)} type="primary">
                                    {t('Send')}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                ) : null}

            </Row>
        );
    }

    /**
     * @event leave comment
     */
    onSubmitComment = () => {
        let { auth, id } = this.props;
        let user_id = auth.profile.id;
        this.commentFormRef.current.validateFields()
            .then(values => {
                let data = Object.assign(values, { user_id, obj_id: id, type: 2 });
                addComment(data).then(res => {
                    let c = res.data;
                    let commentList = this.state.commentList.slice();
                    c['user'] = auth.profile;
                    commentList.push(c);
                    this.setState({ commentList });
                })
            }).catch((info) => console.log('Validate Failed:', info));
    }

    /**
     * Generate Task code
     * @returns 
     */
     generateCode = () => {
        let { projectId } = this.props;
        return `T${Number(projectId).toString(16)}-${dayjs().unix().toString(16).substr(-5)}`.toUpperCase();
    }

    render() {
        let { t, projectId, id } = this.props;
        let { tasks } = this.state;

        return (
            <Modal forceRender style={{ top: 20 }}
                title={
                    <>
                        <b>{t('Task')}</b> &nbsp;&nbsp;
                        <small>
                            {
                                id ?
                                    <Link
                                        to={{
                                            pathname: `/company/projects/${projectId}/edit`,
                                            search: `?task_id=${id}`,
                                        }}
                                        target='_blank'
                                    >
                                        <LinkOutlined /> Clipboard
                                    </Link>
                                    : []
                            }
                        </small>
                    </>
                }
                open={this.props.visible}
                onCancel={() => { this.setState({ hiddenStartAfter: false }); this.props.toggleModal(false) }}
                footer={[
                    <Button key='btn-ok' type='primary' onClick={this.handleFormSubmit.bind(this)} icon={<FontAwesomeIcon icon={faSave} />}>&nbsp;Submit</Button>,
                    <Button key='btn-cancel' onClick={() => this.props.toggleModal(false)} icon={<FontAwesomeIcon icon={faTimes} />}>&nbsp;Cancel</Button>
                ]}
                width={1100}>
                <Form ref={this.formRef} layout="vertical">
                    <Row gutter={[12, 0]}>
                        <Col span={17}>
                            <Form.Item name="id" hidden >
                                <Input />
                            </Form.Item>
                            <Form.Item label={<b>{t('Name')}</b>} name="name" hasFeedback rules={[{ required: true, message: t('Please input name') }]}>
                                <Input placeholder={t('Name')} disabled={!this.checkPermission('edit_task')} />
                            </Form.Item>
                        </Col>
                        <Col span={7}>
                            <Form.Item label={t('Task Code')} name="code" initialValue={this.generateCode()}>
                                <Input placeholder={t('Task Code')} disabled={!this.checkPermission('edit_task')} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[12, 0]}>
                        <Col span={17}>
                            <Form.Item label={t('Assign')} name="assign_staff">
                                <StaffDropdown defaultOption={t('Assign')} mode='multiple'
                                    defaultDatas={this.state.defaultStaffs}
                                    disabled={!this.checkPermission('edit_assign')} />
                            </Form.Item>
                        </Col>
                        <Col span={7}>
                            <Form.Item label={t('Priority')} name="piority">
                                <BaseDropdown datas={projectTaskPriority} disabled={!this.checkPermission('edit_piority')} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[12, 0]}>
                        <Col span={8}>
                            <Form.Item label={t('Start After')} name="start_after">
                                <BaseDropdown datas={projectTaskStartAfter} defaultOption={t('Start After')}
                                    onSelect={(val) => this.onHandleSelectStaffStart(val)}
                                    disabled={!this.checkPermission('edit_task')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label={t('Start time')} name="date_start" hidden={this.state.hiddenStartAfter}>
                                <DatePicker placeholder={t('Start time')}
                                    disabled={!this.checkPermission('edit_timeline')}
                                    style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item label={t('Task')} name="after_task_id" hidden={!this.state.hiddenStartAfter}>
                                <BaseDropdown datas={tasks} defaultOption={t('Task')}
                                    disabled={!this.checkPermission('edit_timeline')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label={t('Deadline')} name="date_end">
                                <DatePicker placeholder={t('Deadline')}
                                    disabled={!this.checkPermission('edit_timeline')}
                                    style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[12, 0]}>
                        <Col span={6}>
                            <Form.Item label={t('Planned hours')} name="planned_hours">
                                <InputNumber min={0} placeholder='Planned hours' className='w-100' />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label={t('Action require')} name="action_id">
                                <BaseDropdown datas={projectTaskActionRequire}
                                    disabled={!this.checkPermission('edit_task')}
                                    defaultOption={t('Action require')} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label={t('Status')} name="status" >
                                <BaseDropdown datas={projectTaskStatus}
                                    disabled={!this.checkPermission('edit_timeline')}
                                    defaultOption={t('Status')} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label={t('% Finished')} name="finish_per">
                                <Input placeholder={t('%')} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Form.Item label={t('Description')} name="note" className={this.checkPermission('edit_task') ? '' : 'ql-disable'}>
                                <Editor
                                    disabled={!this.checkPermission('edit_task')}
                                    style={Object.assign({ height: 150 }, this.checkPermission('edit_task') ? {} : { backgroundColor: '#f2f2f2' })}
                                    value={this.state.note}
                                    onChange={(value) => this.setState({ note: value })}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Form.List name="subtasks">
                                {(fields, { add, remove }) => (
                                    <>
                                        <PageHeader
                                            title={t('Subtasks')}
                                            className="p-0"
                                            tags={
                                                this.checkPermission('add_task') ?
                                                    <Button key="create-practising-certificate" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}
                                                        onClick={() => add({
                                                            status: 0,
                                                            piority: 0
                                                        })}
                                                    />
                                                    : []
                                            }
                                        />
                                        <Divider className="m-0 mb-2" />

                                        {fields.map(field => (
                                            <Row gutter={[6, 0]} key={uniqueId('subtask')}>
                                                <Form.Item {...field} name={[field.name, 'id']} fieldKey={[field.fieldKey, 'id']} hidden>
                                                    <Input />
                                                </Form.Item>
                                                <Col span={8}>
                                                    <Form.Item {...field} name={[field.name, 'name']} fieldKey={[field.fieldKey, 'name']}
                                                        rules={[{ required: true, message: 'Missing name' }]} >
                                                        <Input placeholder="Name" disabled={!this.checkPermission('add_task')} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={5}>
                                                    <Form.Item {...field} name={[field.name, 'assign_staff']} fieldKey={[field.fieldKey, 'assign_staff']}>
                                                        <StaffDropdown placeholder={t("Assign Staff")}
                                                            disabled={!this.checkPermission('edit_assign')}
                                                            defaultDatas={this.state.defaultSubTaskStaffs} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={3}>
                                                    <Form.Item {...field} name={[field.name, 'status']} fieldKey={[field.fieldKey, 'status']} style={{ width: '100%' }}>
                                                        <BaseDropdown datas={projectTaskStatus}
                                                            disabled={!this.checkPermission('edit_assign')}
                                                            placeholder={t('Status')} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={3}>
                                                    <Form.Item {...field} name={[field.name, 'date_start']} fieldKey={[field.fieldKey, 'date_start']} style={{ width: '100%' }}>
                                                        <DatePicker placeholder={t('Date_start')} disabled={!this.checkPermission('edit_timeline')} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={3}>
                                                    <Form.Item {...field} name={[field.name, 'date_end']} fieldKey={[field.fieldKey, 'date_end']} style={{ width: '100%' }}>
                                                        <DatePicker placeholder={t('Deadline')} disabled={!this.checkPermission('edit_timeline')} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={1}>
                                                    <Dropdown menu={
                                                        <Menu>
                                                            <Menu.Item key="0">
                                                                <b>{t('Priority')}</b>
                                                                <Form.Item {...field} name={[field.name, 'piority']} fieldKey={[field.fieldKey, 'piority']} >
                                                                    <BaseDropdown datas={projectTaskPriority} placeholder={t('Priority')} disabled={!this.checkPermission('edit_timeline')} />
                                                                </Form.Item>
                                                            </Menu.Item>
                                                            <Menu.Item key="1">
                                                                <b>{t('Description')}</b>
                                                                <Form.Item {...field} name={[field.name, 'note']} fieldKey={[field.fieldKey, 'note']}>
                                                                    <Input.TextArea rows={4} placeholder={t('Description')} disabled={!this.checkPermission('edit_timeline')} />
                                                                </Form.Item>
                                                            </Menu.Item>
                                                        </Menu>
                                                    } trigger={['click']} placement="topRight">
                                                        <Button type="default" onClick={(e) => e.preventDefault()} icon={<FontAwesomeIcon icon={faCommentDots} color='#ccc' />} />
                                                    </Dropdown>
                                                </Col>
                                                { this.checkPermission('delete_task') ?
                                                    <Col span={1}>
                                                        <Button type="primary" danger onClick={() => remove(field.name)} icon={<FontAwesomeIcon icon={faTrashAlt} />} />
                                                    </Col>
                                                    : []}
                                            </Row>
                                        ))}
                                    </>
                                )}
                            </Form.List>
                        </Col>
                    </Row>
                </Form>
                {this.renderTaskComments()}
            </Modal>
        );
    }
}

/**
 * Map redux state to component props
 * @param {Object} state
 */
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info
    }
}

export default connect(mapStateToProps)(withTranslation()(FormModal));