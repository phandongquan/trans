import { Table } from 'antd';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col, Input, Form, Divider, Popconfirm } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { withTranslation } from 'react-i18next';
import { showNotify, redirect, checkPermission } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { FontAwesomeIcon, } from '@fortawesome/react-fontawesome';
import { faSave, faTrash, faPen, faReply, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { uniqueId } from 'lodash';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { jobSpectific } from '~/constants/basic';
import { detail, deleteAnswer, update as updateAnswer, createQuestion } from '~/apis/company/job/spectific';

import './specific.scss';
class SpectificDetail extends Component {

    /**
    *
    */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.answerFormRef = React.createRef();

        this.state = {
            loading: false,
            input_type: null,
            content: '', // content with react-quill
            answerList: [],
            isAdding: true,
            selectedAnswerIndex: null,
            type: 1,
            specific: {}
        };
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.getDetail();
    }

    /**
     * Get detail Training Question
     */
    async getDetail() {
        let { id } = this.props.match.params;
        if (id) {
            let response = await detail(id);
            if (response.status) {
                const spec = response.data.rows[0]
                if (!spec) return

                let formData = {
                    title: spec.title,
                    code: spec.code,
                    content: spec.content,
                    type: spec.type,
                    input_type: spec.input_type,
                    is_required: spec.is_required,
                    status: spec.status,
                    major_id: spec.major_id
                }

                this.formRef.current.setFieldsValue(formData);

                this.setState({
                    specific: spec,
                    content: spec.content,
                });
            }
        }else{
            this.formRef.current.setFieldsValue({status : 0})
        }
    }

    /**
     * Reset anserForm
     */
    resetAnswerForm() {
        // this.answerFormRef.current.resetFields();
        this.answerFormRef.current.setFieldsValue({
            id: null,
            content: '',
            is_correct: 0
        });
    }

    /**
     * @event click edit answer - Fill data to answerFormRef
     * @param {Integer} id 
     */
    onClickEditAnswer(id, index) {
        let specific = this.state.specific
        let answer = specific.answers[index]
        this.setState({ isAdding: false });
        this.setState({ selectedAnswerIndex: index });
        this.answerFormRef.current.setFieldsValue({ ...answer });
    }

    /**
     * @event cancel edit
     */
    onCancelEditAnswer() {
        this.setState({ isAdding: true, });
        this.resetAnswerForm();
    }

    /**
     * @event delete answer
     * 
     * @param {*} answerId 
     * @param {*} index 
     */
    async onDeleteAnswer(answerId, index) {
        const { t } = this.props;
        if (answerId) {
            let response = await deleteAnswer(answerId);
            if (response.status) {
                showNotify(t('hr:notification'), (t('hr:has_been_remove')));
            }
        }
        let newSpecific = this.state.specific
        this.setState({
            specific: {
                ...newSpecific,
                answers: [
                    ...newSpecific.answers.slice(0, index),
                    ...newSpecific.answers.slice(index + 1)
                ]
            }
        })
        this.resetAnswerForm();
    }

    /**
     * @event add new answer
     */
    async onAddAnswer() {
        const { t } = this.props;
        let formData = this.answerFormRef.current.getFieldsValue();
        let { id } = this.props.match.params;
        let newSpecific = this.state.specific
        let answers = newSpecific.answers ? newSpecific.answers.slice() : []

        if (!formData.content) {
            showNotify((t('hr:notification')), ('Content is required!'), 'error');
            return;
        }

        if (formData.is_correct === undefined || formData.is_correct === null) {
            showNotify((t('hr:notification')), ('Is correct is required!'), 'error');
            return;
        }

        if (id) {
            const data = {
                ...formData,
                id: 0,
                question_id: id
            }
            let response = await updateAnswer(data);
            if (response.status) {
                showNotify((t('hr:notification')), t('hr:success'));
                answers.push(data);
                this.setState({ specific: newSpecific });
                this.resetAnswerForm();
            } else {
                showNotify((t('hr:notification')), t('hr:failed'), 'error');
                return;
            }
        } else {
            const data = {
                ...formData,
                id: 0,
                question_id: 0
            }
            answers.push(data);
        }

        this.setState({
            specific: {
                answers: answers
            }
        });

        this.resetAnswerForm();
    }

    /**
     * @event edit answer
     */
    async onEditAnswer() {
        let { t } = this.props;
        let { id } = this.props.match.params;
        let selectedAnswerIndex = this.state.selectedAnswerIndex;
        let formData = this.answerFormRef.current.getFieldsValue();
        if (id) {
            let response = await updateAnswer({
                ...formData,
                id: formData['id'],
                question_id: id
            });
            if (response.status) {
                showNotify((t('hr:notification')), t('hr:update_susscess'));
            }
        }

        let newSpecific = this.state.specific
        let currentAnswer = newSpecific.answers[selectedAnswerIndex]
        let newAnswer = { ...currentAnswer, ...formData }
        this.setState({
            specific: {
                ...newSpecific,
                answers: [
                    ...newSpecific.answers.slice(0, selectedAnswerIndex),
                    newAnswer,
                    ...newSpecific.answers.slice(selectedAnswerIndex + 1)
                ]
            },
            isAdding: true,
            selectedAnswerIndex: null
        })
        this.resetAnswerForm();
    }

    /**
     * @event submitForm
     */
    async submitForm(values) {
        let { t, auth } = this.props;
        let { staff_info } = auth
        let data = { ...values, input_type: 1, is_required: 1 };
        data['content'] = this.state.content;
        let { id } = this.props.match.params;
        let response;

        if (id) {
            data = {
                id: id,
                created_by: staff_info.staff_id,
                ...data,
                input_type: 1,
            }
            response = await createQuestion(data);
            if (response.status) {
                showNotify((t('hr:notification')), t('hr:update_susscess'));
            } else {
                showNotify((t('hr:notification')), response.message, 'error');
            }
        } else {
            data = {
                id: 0,
                created_by: staff_info.staff_id,
                ...data,
                answers: this.state.specific.answers,
                code: "",
                title: "",
            }
            response = await createQuestion(data);
            if (response.status) {
                showNotify((t('hr:notification')), t('hr:update_susscess'));
                return redirect('/company/job/specific');
            } else {
                showNotify((t('hr:notification')), response.message, 'error');
            }
        }
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
     * @render button answer action
     */
    renderBtnAction() {
        let { t } = this.props;
        if (this.state.isAdding) {
            return (
                checkPermission('hr-trainning-question-update') ?
                    <Button style={{ width: '100%' }} type="primary" htmlType="submit"
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={this.onAddAnswer.bind(this)}
                    > &nbsp;{t('hr:add_new')}</Button >
                    : ''
            );
        } else {
            return (
                <div className='d-flex btn_actions_specific'  >
                    <Button type="primary" htmlType="submit" className="mr-2"
                        icon={<FontAwesomeIcon icon={faSave} />}
                        onClick={this.onEditAnswer.bind(this)}
                    >{t('hr:update')}</Button>
                    <Button type="primary" htmlType="submit"
                        icon={<FontAwesomeIcon icon={faTimes} />}
                        onClick={this.onCancelEditAnswer.bind(this)}
                        ghost={true}>{t('hr:cancel')}</Button>
                </div>
            );
        }
    }

    /**
    * @render
    */
    render() {
        let { t, baseData: { majors = [] } } = this.props;

        const { specific } = this.state;

        const columns = [
            {
                title: 'No.',
                align: 'center',
                render: r => specific?.answers.indexOf(r) + 1
            },
            {
                title: t('hr:content'),
                dataIndex: 'content'
            },
            {
                title: t('hr:is_correct'),
                dataIndex: 'is_correct'
            },
            {
                align: 'center',
                title: t('hr:action'),
                width: 100,
                render: (r, a, i) => (
                    <>
                        {
                            checkPermission('hr-trainning-question-update') ?
                                <Button type="primary" size='small'
                                    onClick={(e) => this.onClickEditAnswer(r.id, i)}
                                    icon={<FontAwesomeIcon icon={faPen} />}>
                                </Button>
                                : ''
                        }

                        <Popconfirm title={t('Confirm delete selected item?')} placement="topLeft"
                            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                            onConfirm={(e) => this.onDeleteAnswer(r.id, i)}>
                            {
                                checkPermission('hr-trainning-question-update') ?
                                    <Button type="primary" size='small' style={{ marginLeft: 8 }} icon={<FontAwesomeIcon icon={faTrash} />} />
                                    : ''
                            }
                        </Popconfirm>
                    </>
                )
            }
        ];

        const isSmallScreen = window.innerWidth <= 1366;

        return (
            <div className='mt-2'>
                <Row >
                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                        <Row className='card mr-1 p-3 pt-0'>
                            <PageHeader title={t('hr:question')} className="p-0" />
                            <Form ref={this.formRef} name="upsertForm"
                                className="ant-advanced-search-form " layout="vertical"
                                onFinish={this.submitForm.bind(this)}>
                                {/* <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12} key='title'>
                                        <Form.Item name="title" label={t('Question Title')} rules={[{ required: true, message: t('Please input question name!') }]} hasFeedback>
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12} key='code'>
                                        <Form.Item name="code" label={t('Code')} rules={[{ required: true, message: t('Please input question code!') }]} hasFeedback>
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row> */}
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12} key='question_type'>
                                        <Form.Item name="type" label={t('hr:question_type')} rules={[{ required: true, message: t('hr:please_choose_type') }]} hasFeedback>
                                            <Dropdown datas={jobSpectific['type']}
                                                defaultOption="-- Choose Type --"
                                                onChange={(type) => this.setState({ type })} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12} key='input_type'>
                                        <Form.Item name="major_id" label={t('hr:major')} rules={[{ required: true, message: t('hr:input_majors') }]} hasFeedback>
                                            <Dropdown
                                                datas={majors}
                                                mode="multiple"
                                                defaultOption="-- Choose Input Type --"
                                            />
                                        </Form.Item>
                                    </Col>
                                    {/* <Col xs={24} sm={24} md={24} lg={12} xl={12} key='is_required'>
                                        <Form.Item name="is_required" label={t('Is Required?')} rules={[{ required: true, message: t('Please choose is required!') }]} hasFeedback>
                                            <Dropdown datas={jobSpectific['is_required']} defaultZero />
                                        </Form.Item>
                                    </Col> */}
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12} key='status'>
                                        <Form.Item name="status" label={t('hr:status')} rules={[{ required: true, message: t('hr:input_status') }]} hasFeedback>
                                            <Dropdown datas={jobSpectific['status']} defaultOption="-- Choose Status --" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <Form.Item label={t('hr:question_title')}>
                                            <ReactQuill style={{ height: 200, marginBottom: 40 }} value={this.state.content} onChange={(value) => this.setState({ content: value })} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Divider className="m-0" />
                                <Row gutter={24} className="pt-3">
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} key='bnt-submit'>
                                        <Button htmlType="submit" type="primary" loading={this.state.loading}
                                            icon={<FontAwesomeIcon icon={faSave} />}
                                            onClick={this.enterLoading.bind(this)}>
                                            &nbsp;{t('hr:save')}
                                        </Button>
                                    </Col>
                                    <Col xs={23} sm={12} md={12} lg={12} xl={12} key='btn-back' style={{ textAlign: "right" }}>
                                        <Link to={`/company/job/specific`}>
                                            <Button type="default" icon={<FontAwesomeIcon icon={faReply} />}>
                                                &nbsp;{t('hr:back')}
                                            </Button>
                                        </Link>
                                    </Col>
                                </Row>
                            </Form>
                        </Row>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                        <Row className='card p-3 pt-0'>
                            <PageHeader title={t('hr:answer')} className="p-0" />
                            {specific?.answers?.length ? (
                                <Table dataSource={specific?.answers} columns={columns}
                                    rowKey={r => uniqueId()}
                                    pagination={{ pageSize: 20, hideOnSinglePage: true }} />
                            ) : [<p><b>Text Question. Need no answer choice!</b></p>]}
                            <Form ref={this.answerFormRef} name="supsertForm" className="ant-advanced-search-form mt-2" layout="vertical">
                                <Row gutter={[8, 8]}>
                                    <Col span={isSmallScreen ? 10 : 12} >
                                        <Form.Item name="id" hidden >
                                            <Input />
                                        </Form.Item>
                                        <Form.Item name="content">
                                            <Input placeholder={('Answer')} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={5} >
                                        <Row align='center' className='row_actions_specific' >
                                            <Form.Item name="is_correct"  >
                                                <Dropdown datas={jobSpectific['correct']} defaultZero />
                                            </Form.Item>
                                        </Row>
                                    </Col>
                                    <Col span={isSmallScreen ? 9 : 7} >
                                        {this.renderBtnAction()}
                                    </Col>
                                </Row>
                            </Form>
                        </Row>
                    </Col>
                </Row >
            </div >
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
export default connect(mapStateToProps)(withTranslation()(SpectificDetail));