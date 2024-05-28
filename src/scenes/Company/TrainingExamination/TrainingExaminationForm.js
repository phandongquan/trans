import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Button, Row, Table, Col, Input, Form, Divider, DatePicker, Menu, Modal, Dropdown as DropdownBasic, InputNumber } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import TooltipButton from '~/components/Base/TooltipButton';
import Dropdown from '~/components/Base/Dropdown';
import { debounce, uniqueId } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faBackspace, faPlus, faSearch, faEye, faFilter, faBell, faEdit } from '@fortawesome/free-solid-svg-icons';
import { ExclamationCircleOutlined, MenuUnfoldOutlined, PercentageOutlined, SettingOutlined } from '@ant-design/icons';
import { trainingExamTypes, levels, trainingExamStatus, trainingExamResults, trainingExamFormStatus, dateTimeFormat } from '~/constants/basic';
import { Link } from 'react-router-dom';
import { showNotify, redirect, checkManager, checkISO, timeFormatStandard, checkPermission } from '~/services/helper';
import {
    detail as detailExam, update as updateExam, create as createExam, addStaffExam, removeStaffExam,
    updateStatus as apiUpdateStatusTrainingExam, checkStaffThroughSkill, applyTime
} from '~/apis/company/trainingExamination';
import { updateLevel as apiUpdateLevel } from '~/apis/company/staff/skill';
import { searchForDropdown as getSkillList } from '~/apis/company/skill';
import DeleteButton from '~/components/Base/DeleteButton';
import StaffDropdown from '~/components/Base/StaffDropdown';
import FormStaffFilter from '~/components/Company/TrainingExamination/FormStaffFilter';
import FormSendNotification from '~/components/Company/TrainingExamination/FormSendNotification';
import './config/TrainingExaminationForm.css';

import {screenResponsive} from '~/constants/basic';
const dateFormat = 'YYYY-MM-DD HH:mm';
const { TextArea } = Input;
const { confirm } = Modal;
const arrAutoLevel = {1:'Yes', 0:'No'}

class TrainingExaminationForm extends Component {
    /**
     *
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.formStaffRef = React.createRef();
        this.formSkillFilter = React.createRef();
        this.state = {
            loading: false,
            exam: {},
            skillId: null,
            totalOfQuestion: 0,
            listStaffExam: [],
            listSkill: [],
            staffsThroughSkill: [],
            staffSelectedRowKeys: [],
            hideSuperVisor: true,
            loadingTableStaff: false,
            // Form staff filter popup
            visibleStaffForm: false,
            visibleSendNotifiForm: false
        };

        this.getListSkill = debounce(this.getListSkill, 500);
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        /**
         * @set form default value
         */
        this.formRef.current.setFieldsValue({
            status: 1
        });
        let { id } = this.props.match.params;
        if (id) {
            this.getDetail(id);
        }
    }

    /**
     * Request detail and set form value
     * @param {integer} id 
     */
    async getDetail(id) {
        let response = await detailExam(id);
        if (response.status == 1 && response.data) {
            let { data } = response;
            let skillId = data.skill_id;

            this.setState({
                skillId,
                exam: data,
                listStaffExam: data.staff,
                hideSuperVisor: data.type == 2 ? false : true,
            }, () => this.getListSkill({ id: skillId }));

            if (data.staff.length) {
                checkStaffThroughSkill({
                    skill_id: skillId,
                    list_staff: data.staff.map(s => s.staff_id)
                }).then(res => res.status == 1 && this.setState({ staffsThroughSkill: res.data }))
            }

            let formData = {};
            Object.keys(data).map(key => {
                if (['start_from'].includes(key)) {
                    formData[key] = data[key] ? dayjs(data[key] * 1000) : null;
                } else {
                    formData[key] = data[key] ? data[key] : null;
                }
            });

            this.formRef.current.setFieldsValue(formData);
        } else {
            this.backToExamList('Model not found!');
        }
    }

    /**
     * @event submitForm
     */
    async submitForm(values) {
        let { t, match } = this.props;
        let { id } = match.params;

        let data = { start_from: values.start_from.format(dateFormat) };
        data = { ...values, ...data };

        let response, message;
        if (id) {
            response = await updateExam(id, data);
            message = t('Examination updated!');
        } else {
            response = await createExam(data);
            message = t('Examination Created!');
        }

        if (response.status) {
            showNotify(t('hr:notification'), message);
            if (!id) {
                return redirect('/company/training-examination');
            }
        } else {
            showNotify(t('hr:notification'), response.message, 'error');
        }
    }

    /**
     * @event submit add staff for exam
     */
    async submitAddStaffExam(values) {
        this.setState({ loadingTableStaff: true })
        let { t, match, history } = this.props;
        let { id } = match.params;
        let data = { start_from: values.start_from.format(dateFormat) };
        data = { ...values, ...data };

        let response = await addStaffExam(id, data);
        if (response.status == 1) {
            showNotify(t('hr:notification'), t('hr:delete_complete'), 'success', 1, () => {
                this.formStaffRef.current.resetFields();
                let xhr = detailExam(id);
                xhr.then(response => {
                    this.setState({ loadingTableStaff: false })
                    if (response.status == 1 && response.data) {
                        this.setState({ listStaffExam: response.data.staff })
                    }
                })
            });
        }
    }

    /**
     * @event remove staff exam
     * @param {*} e 
     * @param {*} itemId 
     */
    async onDeleteStaffExam(e, itemId) {
        e.stopPropagation();
        let { t, match } = this.props;
        let { id } = match.params;
        let response = await removeStaffExam(id, itemId);

        if (response.status == 1) {
            let listStaffExam = [...this.state.listStaffExam];
            /**
             * Update list staff exam
             */
            let index = listStaffExam.indexOf(listStaffExam.find(se => se.id == itemId));
            listStaffExam.splice(index, 1);
            this.setState({ listStaffExam });

            let { t } = this.props;
            showNotify(t('hr:notification'), t('hr:delete_complete'));
        }
    }

    /**
     * 
     * @param {Array} staffList 
     */
    convertListStaffToObj(staffList) {
        let convertObj = {};
        staffList.map(s => {
            convertObj[s.staff_id] = `${s.staff_name} # ${s.code}`;
        })
        return convertObj;
    }

    /**
     * List skill for dropdown
     */
    async getListSkill(params = {}) {
        params = {
            ...params,
            total_questions: true
        }
        let skillResponse = await getSkillList(params);
        if (skillResponse && skillResponse.data) {
            let listSkill = skillResponse.data.results;
            this.setState({ listSkill }, () => this.setTotalQuestions(this.state.skillId));
        }
    }

    /**
     * @event change skill, refresh list staff
     * @param {*} value 
     */
    onSelectSKill(value) {
        this.setTotalQuestions(value);
        let { match } = this.props;
        let { id } = match.params;
        if (id) {
            this.formStaffRef.current.resetFields(['staff_id']);
        }
        this.formRef.current.resetFields(['monitor_id']);
    }

    /**
     * @event Search skill
     * @param {*} value 
     */
    onSearchSkill(value) {
        if (!value) {
            return;
        }
        this.getListSkill({ value });
    }

    /**
     * Set total_questions for skill
     * @param {*} skillId 
     */
    setTotalQuestions(skillId) {
        if (!this.state.listSkill.length) {
            return;
        }
        let skill = this.state.listSkill.find(s => s.id == skillId);
        if (skill) {
            this.setState({ totalOfQuestion: skill.total_questions });
        }
    }

    /**
     * Show loading button
     */
    enterLoading = () => {
        this.setState({ loading: true });
        setTimeout(() => {
            this.setState({ loading: false });
        }, 1000);
    }

    /**
     * Redirect to Training Examation List
     * @param {*} message 
     */
    backToExamList(message = '') {
        let { t } = this.props;
        if (message) {
            showNotify(t('hr:notification'), t('hr:message'), 'error');
        }
        redirect('/company/training-examination');
    }

    /**
     * Update staffs in list
     * @param {*} field 
     * @param {*} value 
     */
    updateStaffs = (field, value) => {
        this.setState({ loading: true })
        let data = { id: this.state.staffSelectedRowKeys }
        data[field] = value;

        let { t } = this.props;
        let { id } = this.props.match.params;
        let xhr = apiUpdateStatusTrainingExam(data);
        xhr.then(response => {
            if (response.status) {
                showNotify(t('hr:notification'), t('hr:update_sucess'));
                this.setState({ staffSelectedRowKeys: [] })
                if (id) this.getDetail(id);
            } else {
                showNotify(t('hr:notification'), t('hr:server_error'), 'error');
            }
            this.setState({ loading: false })
        })
    }
    /**
     * Update staff_skill level
     * @param {integer} level 
     */
    updateLevel = (level) => {
        const { t } = this.props;
        let { staffSelectedRowKeys, listStaffExam  } = this.state;
        let staff_ids = [];
        if(Array.isArray(listStaffExam)) {
            staffSelectedRowKeys.map(id => {
                let row = listStaffExam.find(se =>  se.id == id);
                staff_ids.push(row?.staff_id);
            });
        }

        confirm({
            title: t('hr:confirm'),
            icon: <ExclamationCircleOutlined />,
            maskStyle: { background: 'rgba(0, 0, 0, 0.1)' },
            content: `Update staff list with level = ${level}?`,
            onOk: async () => {
                this.setState({ loading: true });
                let { t } = this.props;
                let { id } = this.props.match.params;
                let data = {
                    skill_id: this.state.skillId,
                    staff_ids,
                    level,
                    _method: 'PUT'
                };
                let response = await apiUpdateLevel(data);

                if (response.status == 1) {
                    showNotify(t('hr:notification'), t('hr:update_sucess'));
                    this.setState({ staffSelectedRowKeys: [] })
                    if (id) this.getDetail(id);
                } else {
                    showNotify(t('hr:notification'), t('hr:server_error'), 'error');
                }
                this.setState({ loading: false })
            },
            onCancel: () => { },
        });

    }

    /**
     * Apply time for staff
     */
    applyTimeForStaff = async () => {
        const { t } = this.props;
        let values = this.formRef.current.getFieldsValue();
        if(typeof values.start_from == 'undefined' || !values.start_from) {
            showNotify(t('hr:notification'), t('hr:select_time_start'), 'error');
            return false;
        }

        let id = this.props.match.params.id;
        let data = {
            id,
            start_from: timeFormatStandard(values.start_from, dateTimeFormat)
        }
        this.setState({ loading: true })
        let response = await applyTime(data);
        this.setState({ loading: false })
        if(response.status) {
            showNotify(t('hr:notification'), 'Success');
            this.getDetail(id);
        } else {
            showNotify(t('hr:notification'), response.message, 'error');
        }
    }

    /** 
     * Toggle popup filter skill
     */
    toggleStaffFilterModal = (visibleStaffForm = true) => {
        this.setState({ visibleStaffForm });
    }

    /**
     * Toggle popup form send notification
     * @param {*} visibleSendNotifi 
     */
    toggleSendNotifiModal = (visibleSendNotifiForm = true) => {
        this.setState({ visibleSendNotifiForm });
    }

    /**
     * @render
     */
    render() {
        let { t, match, baseData: { locations }, auth: {staff_info} } = this.props;
        let id = match.params.id;
        let { exam, staffSelectedRowKeys, skillId } = this.state;
        let subTitle = '';
        if (id) {
            subTitle = t('hr:update') + ' ' + t('hr:training_exam');
        } else {
            subTitle = t('add_new')+ ' ' + t('hr:training_exam');
        }

        const staffHasSelected = staffSelectedRowKeys.length > 0;

        const menuDropDownStatus = (
            <Menu onClick={(e) => this.updateStaffs('status', e.key)}>
                { Object.keys(trainingExamStatus).map(key => <Menu.Item key={key} >{trainingExamStatus[key]}</Menu.Item>)}
            </Menu>
        );

        const menuDropDownResult = (
            <Menu onClick={(e) => this.updateStaffs('examination_result', e.key)}>
                { Object.keys(trainingExamResults).map(key => <Menu.Item key={key} >{trainingExamResults[key]}</Menu.Item>)}
            </Menu>
        );

        const menuDropDownLevel = (
            <Menu onClick={(e) => this.updateLevel(e.key)}>
                { Object.keys(levels).map(key => <Menu.Item key={key} >{levels[key]}</Menu.Item>)}
            </Menu>
        );

        const columns = [
            {
                title: 'No.',
                align: 'center',
                render: r => this.state.listStaffExam.indexOf(r) + 1
            },
            {
                title: t('hr:name'),
                render: (r) => {
                    let staff = r.staff, renderText = '';
                    let locationFound = locations.find(l => l.id == staff.staff_loc_id && l.name);

                    let previewIcon = (
                        <Link to={`/company/staff/${r.staff_id}/skill`} target='_blank'>
                            <FontAwesomeIcon icon={faSearch} />
                        </Link>
                    );
                    if (staff) {
                        renderText = (
                            <>
                                <div>
                                    {previewIcon} {`${staff.staff_name}`} #<small>{staff.code}</small>
                                    <small> ({locationFound && locationFound.name})</small>
                                </div>
                                {
                                    r.status == 3 ? (
                                        <>
                                            <small>{`Started at: ${r.start_at}`}</small>
                                            <br />
                                            <small>{`End at: ${r.end_at}`}</small>
                                        </>
                                    ) : []
                                }
                            </>
                        );
                    }
                    return renderText;
                },
            },
            {
                title: t('hr:start_from'),
                dataIndex: 'start_from'
            },
            {
                title: t('hr:status'),
                render: r => typeof trainingExamStatus[r.status] !== 'undefined' ? trainingExamStatus[r.status] : ''
            },
            {
                title: t('hr:result'),
                render: r => {
                    let returnText = '';
                    if (!r.examination_result) {
                        returnText = 'N/A';
                    } else {
                        let resultText = '';
                        if (r.examination_result == 1) {
                            resultText = 'Fail';
                        } else {
                            resultText = 'Pass';
                        }
                        if (r.examination_data) {
                            let examData = r.examination_data ? JSON.parse(r.examination_data) : {};
                            let totalQuestion = examData.totalQuestion || exam.number_of_questions;
                            returnText = (
                                <>
                                    <span>{resultText}</span><br />
                                    <strong>{`${examData.totalCorrectAnswer}/${totalQuestion}`}</strong>
                                </>
                            );
                        } else {
                            returnText = resultText;
                        }
                    }
                    return returnText;
                }
            },
            {
                title: t('hr:action'),
                align: 'center',
                width: '15%',
                render: (r) => {
                    let btnArr = [];
                    if (r.status !== 3) {
                        if(exam?.type == 2 && checkManager(staff_info.position_id) || checkISO(staff_info.major_id)) {
                            btnArr.push(
                                <Link key={`edit-staff-exam-${r.id}`} className='mr-1' to={`/company/training-examination/${r.id}/history`}  target="_blank">
                                    <TooltipButton title={t('hr:edit')} type="primary" size='small' icon={<FontAwesomeIcon icon={faEdit} />} />
                                </Link>
                            );
                        }
                        btnArr.push(
                            checkPermission('hr-training-examination-detail-delete') ? 
                            <DeleteButton key={`delete-staff-exam-${r.id}`} onConfirm={(e) => this.onDeleteStaffExam(e, r.id)} />
                            : ''
                        );
                    } else {
                        btnArr.push(
                            <Link to={`/company/training-examination/${r.id}/history`} key="history-link" target="_blank">
                                <TooltipButton title={t('r:view')} type="primary" size='small' icon={<FontAwesomeIcon icon={faEye} />} />
                            </Link>
                        );
                    }
                    return btnArr;
                },
            },
        ];

        return (
            <div id='page_training_exam'>
                <PageHeader title={t('hr:training_exam')} subTitle={subTitle} />
                <Row>
                    <Col xs={24} sm={24} md={24} lg={10} xl={10}>
                        <Form ref={this.formRef} name="detailForm" className="ant-advanced-search-form" layout="vertical"
                            onFinish={this.submitForm.bind(this)}
                        >
                            <Row className='card mr-1 p-3 pt-0 mb-3'>
                                <PageHeader title={t('hr:examined')} className="p-0" />
                                <Divider className="m-0 mb-2" />
                                <Col span={24}>
                                    <Form.Item name="title" label={t('hr:title')} hasFeedback rules={[{ required: true, message: t('hr:input_title') }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="description" label={t('hr:description')}>
                                        <TextArea rows={3} />
                                    </Form.Item>
                                </Col>
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item name="type" label={t('hr:type')}>
                                            <Dropdown datas={trainingExamTypes} onChange={(e) => this.setState({ hideSuperVisor: e == 2 ? false : true })} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item name="number_of_questions" label={t('no_question')}>
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item name="percent" label={t('hr:percent_pass')}>
                                            <InputNumber addonAfter={<PercentageOutlined  />} className='w-100' />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Row className='pr-3'>
                                            <Col xs={20} sm={20} md={20} lg={22} xl={22}>
                                                <Form.Item name="start_from" label={t('hr:start_from')} hasFeedback rules={[{ required: true, message: t('hr:please_start_date') }]}>
                                                    <DatePicker showTime format={dateFormat} style={{ width: '100%' }} />
                                                </Form.Item>    
                                            </Col>
                                            <Col xs={4} sm={4} md={4} lg={2} xl={2}>
                                                { id ?
                                                    <TooltipButton title={t('hr:apply_time')} icon={<MenuUnfoldOutlined />}
                                                    loading={this.state.loading}
                                                    onClick={() => this.applyTimeForStaff()}
                                                    className='ml-1'
                                                    style={{ marginTop: 31 }}
                                                />
                                                : ''}    
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item name="duration" label={t('hr:duration') + '(mins)'}>
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item name="auto_level" label={t('hr:self_degrading')}>
                                            <Dropdown datas={arrAutoLevel} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item name="skill_id" label={t('hr:skill')}
                                            extra={[<span key='total_questions'>{t('hr:total_skill')}: {this.state.totalOfQuestion}</span>]}
                                            hasFeedback rules={[{ required: true, message: t('hr:please_select_skill') }]}>
                                            <Dropdown datas={this.state.listSkill} onSelect={this.onSelectSKill.bind(this)} onClear={this.onSelectSKill.bind(this)}
                                                onSearch={this.onSearchSkill.bind(this)} defaultOption={t('hr:search_skill')} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item name="monitor_id" label={t('hr:supervisor')} hidden={this.state.hideSuperVisor}
                                            rules={[{
                                                required: !this.state.hideSuperVisor,
                                                message: t('hr:please_select_supervisor')
                                            }]}>
                                            <StaffDropdown defaultOption={t('hr:se_supervisor')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item name="status" label={t('hr:status')} hasFeedback rules={[{ required: true, message: t('hr:please_select_status') }]}>
                                            <Dropdown datas={trainingExamFormStatus} defaultOption={t('hr:all_status')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item name="level" label={t('hr:level')}>
                                            <Dropdown datas={levels} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item name="note" label={t('hr:note')}>
                                            <TextArea rows={3} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row >
                                    <Divider className="mt-1 mb-2" />
                                    <Col span={12}>
                                        {
                                            checkPermission('hr-training-examination-update') ? 
                                                <Button type="primary"
                                                    icon={<FontAwesomeIcon icon={faSave} />}
                                                    htmlType="submit"
                                                    loading={this.state.loading}
                                                    onClick={this.enterLoading.bind(this)}
                                                >
                                                    &nbsp;{t('hr:save')}
                                                </Button>
                                            : ''
                                        }
                                    </Col>
                                    <Col span={12} key='btn-back' style={{ textAlign: "right" }}>
                                        <Link to={`/company/training-examination`}>
                                            <Button type="default"
                                                icon={<FontAwesomeIcon icon={faBackspace} />}
                                            >&nbsp;{t('hr:back')}</Button>
                                        </Link>
                                    </Col>
                                </Row>
                            </Row>
                        </Form>
                    </Col>
                    {id ? (
                        <Col xs={24} sm={24} md={24} lg={14} xl={14}>
                            <Form ref={this.formStaffRef} name="staffForm"
                                className="ant-advanced-search-form" layout="vertical"
                                onFinish={this.submitAddStaffExam.bind(this)}
                            >
                                <div id='box_staff_page_training_exam' className= {window.innerWidth < screenResponsive  ? 'card p-3 pt-0 table_in_block' : 'card ml-3 p-3 pt-0 table_in_block' }>
                                    <PageHeader title={t('hr:staff')} className="p-0" />
                                    <Divider className="m-0 mb-2" />
                                    <div style={{ marginBottom: 16 }}>
                                        <DropdownBasic.Button menu={menuDropDownStatus} disabled={!staffHasSelected}>
                                        {t('hr:status')}
                                        </DropdownBasic.Button>
                                        <DropdownBasic.Button menu={menuDropDownResult} disabled={!staffHasSelected} style={{ marginLeft: 8 }}>
                                        {t('hr:result')}
                                        </DropdownBasic.Button>
                                        <DropdownBasic.Button menu={menuDropDownLevel} disabled={!staffHasSelected} style={{ marginLeft: 8 }}>
                                        {t('hr:level')}
                                        </DropdownBasic.Button>
                                        <span style={{ marginLeft: 8 }}>
                                            {staffHasSelected ? `Selected ${staffSelectedRowKeys.length} items` : ''}
                                        </span>
                                    </div>
                                    {window.innerWidth < screenResponsive  ? 
                                        <div className='block_scroll_data_table'>
                                            <div className='main_scroll_table'>
                                                <Table key='staff_table' loading={this.state.loadingTableStaff}
                                                    rowSelection={{
                                                        selectedRowKeys: staffSelectedRowKeys,
                                                        onChange: (e) => this.setState({ staffSelectedRowKeys: e })
                                                    }}
                                                    rowClassName={(r) => this.state.staffsThroughSkill.includes(r.staff_id) ? 'through-skill' : ""}
                                                    dataSource={this.state.listStaffExam ? this.state.listStaffExam : []}
                                                    pagination={{ pageSize: 1000, hideOnSinglePage: true }}
                                                    columns={columns} rowKey={(r) => r.id}
                                                />
                                            </div>
                                        </div> 
                                            :
                                        <Table key='staff_table' loading={this.state.loadingTableStaff}
                                            rowSelection={{
                                                selectedRowKeys: staffSelectedRowKeys,
                                                onChange: (e) => this.setState({ staffSelectedRowKeys: e })
                                            }}
                                            rowClassName={(r) => this.state.staffsThroughSkill.includes(r.staff_id) ? 'through-skill' : ""}
                                            dataSource={this.state.listStaffExam ? this.state.listStaffExam : []}
                                            pagination={{ pageSize: 1000, hideOnSinglePage: true }}
                                            columns={columns} rowKey={(r) => r.id}
                                        />
                                    }
                                    <Divider className="m-0 mb-2" />
                                    <Col span={24}>
                                        <Row gutter={12}>
                                            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                                <Form.Item name="start_from" label={t('hr:start_from')} rules={[{ required: true, message: t('hr:select_date') }]} hasFeedback>
                                                    <DatePicker format={dateFormat} style={{ width: '100%' }} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                                <Form.Item name="staff_id" label={t('hr:staff')} rules={[{ required: true, message: t('hr:please_select_staff') }]} hasFeedback>
                                                    <StaffDropdown defaultOption={t('hr:staff')} mode='multiple' />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                                <Form.Item label={t('hr:filter')}>
                                                    {
                                                        checkPermission('hr-training-examination-detail-create') ?
                                                            <Button type='primary' onClick={() => this.toggleStaffFilterModal()} icon={<FontAwesomeIcon icon={faFilter} />}></Button>
                                                        : ''
                                                    }
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row gutter={12}>
                                            <Col xs={24} sm={24} md={24} lg={12} xl={12} >
                                                {
                                                    checkPermission('hr-training-examination-detail-create') ?
                                                        <Button type="primary" icon={<FontAwesomeIcon icon={faPlus} />} htmlType="submit"
                                                            onClick={this.enterLoading.bind(this)}>
                                                            &nbsp;{t('hr:add_new')}
                                                        </Button>
                                                    : ''
                                                }
                                            </Col>
                                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                                <div style={{ textAlign: 'right' }} key="btn-send-notification">
                                                    <Button type='primary'
                                                        onClick={() => this.toggleSendNotifiModal(true)}
                                                        icon={<FontAwesomeIcon icon={faBell} />}>&nbsp; {t('hr:send_notify')}
                                                    </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Col>
                                </div>
                            </Form>
                        </Col>
                    ) : []}
                </Row>
                <FormStaffFilter visible={this.state.visibleStaffForm} toggleModal={this.toggleStaffFilterModal.bind(this)}
                    skillId={skillId} examId={id} formStaffRef={this.formStaffRef} exam={this.state.exam}
                    callback={(listStaffExam) => this.setState({ listStaffExam })}
                />

                <FormSendNotification 
                    visible={this.state.visibleSendNotifiForm}
                    examId={id}
                    examType={exam.type}
                    listStaffExam={this.state.listStaffExam}
                    staffSelectedRowKeys={this.state.staffSelectedRowKeys}
                    toggleModal={this.toggleSendNotifiModal.bind(this)}
                />
            </div>
        );
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

export default connect(mapStateToProps)(withTranslation()(TrainingExaminationForm));