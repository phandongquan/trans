import { Table } from 'antd';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col, Input, Form, Divider, Popconfirm } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { withTranslation } from 'react-i18next';
import { detail as questionDetails, update as updateQuestion, create as createQuestion, deleteAnswer, addAnswer, updateAnswer } from '~/apis/company/TrainningQuestion';
import { getDocument as getListDocument } from '~/apis/company/document';
import { showNotify, redirect, checkPermission } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { FontAwesomeIcon, } from '@fortawesome/react-fontawesome';
import { faSave, faTrash, faPen, faReply, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { uniqueId, debounce } from 'lodash';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { staffStatus, trainingExamTypes, trainingQuestionInputTypes, basicStatus, trainingQuestionLevels, trainingQuestionInputTypesTheory, trainingQuestionInputTypesPractice, basicField } from '~/constants/basic';
import DocumentDropDown from '~/components/Base/DocumentDropDown';

class TrainningQuestionForm extends Component {

    /**
    *
    */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.answerFormRef = React.createRef();

        this.state = {
            loading: false,
            documentList: [],
            input_type: null,
            content: '', // content with react-quill
            answerList: [],
            isAdding: true,
            selectedAnswerIndex: null,
            type: 1,
            data: {}
        };

        this.getListDocument = debounce(this.getListDocument, 500);
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        /**
         * @set form default value
         */
        this.formRef.current.setFieldsValue({
            type: 1,
            input_type: 1,
            is_required: 0,
            status: 3,
            level: 1
        });
        this.answerFormRef.current.setFieldsValue({ is_correct: 0 })

        this.getDetail();
    }

    /**
     * Get detail Training Question
     */
    async getDetail() {
        let { id } = this.props.match.params;
        if (id) {
            let response = await questionDetails(id);
            if (response.status) {
                let data = response.data.document;
                this.setState({
                    content: data.content,
                    answerList: data.detail,
                    type: data.type
                });

                let formData = {};
                Object.keys(data).map(key => {
                    if (key == 'document_id') {
                        formData[key] = data[key] != 0 ? data[key] : null;
                    } else {
                        formData[key] = typeof data[key] !== 'undefined' ? data[key] : null;
                    }
                });
                this.formRef.current.setFieldsValue(formData);


                const { document_id } = formData;

                this.getListDocument({
                    // limit: 0,
                    // offset: 0,
                    id: document_id,
                });


                this.setState({ input_type: formData['input_type'], data: formData });
            }
        }

    }

    /**
     * 
     * @param {Object} params 
     */
    async getListDocument(params = {}) {
        let response = await getListDocument(params);

        if (response.status == 1) {
            this.setState({
                documentList: response.data.rows
            });
        }
    }

    /**
     * @event search document
     * @param {*} value 
     */
    onSearchDocument(value) {
        this.getListDocument({
            limit: 20,
            q: value
        });
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
        let answerList = this.state.answerList.slice();
        let answer = {};
        this.setState({ isAdding: false });
        if (id) {
            answer = answerList.find(a => a.id == id);
        } else {
            answer = answerList[index];
        }
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
        let { id } = this.props.match.params;
        if (id && answerId) {
            let response = await deleteAnswer(id, answerId);
            if (response.status) {
                showNotify(t('hr:notification'), t('hr:remove'));
            } else {
                showNotify(t('hr:notification'), t('hr:failed'), 'error');
                return;
            }
        }
        let answerList = this.state.answerList.slice();
        answerList.splice(index, 1);
        this.setState({
            answerList,
            isAdding: true
        });
        this.resetAnswerForm();
    }

    /**
     * @event add new answer
     */
    async onAddAnswer() {
        const { t } = this.props;
        let formData = this.answerFormRef.current.getFieldsValue();
        let { id } = this.props.match.params;
        let answerList = this.state.answerList.slice();
        if (id) {
            let form = this.formRef.current.getFieldsValue();
            const { input_type } = form;

            let count = 0;
            answerList.map((item) => {
                if (item.is_correct == 1) {
                    count++;
                }
            });

            if (input_type == 1 && count == 1) {
                showNotify(t('hr:notification'), ('Must have only one correct answer!'), 'error');
                return;
            }

            let response = await addAnswer(id, {
                ...formData,
                answer: formData['content']
            });
            if (response.status) {
                showNotify(t('hr:notification'), t('hr:successed'));

                answerList.push(response.data.update);
                this.setState({ answerList });
                this.resetAnswerForm();
            } else {
                showNotify(t('hr:notification'), t('hr:failed'), 'error');
                return;
            }
        } else {
            answerList.push(formData);
        }

        this.setState({ answerList });
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
            let count = 0;
            this.state.answerList.map((item) => {
                if (item.is_correct == 1) {
                    count++;
                }
            });
            count = formData['is_correct'] == 1 ? count + 1 : count - 1;

            //one choice
            if (this.state.input_type == 1 && count != 1) {
                showNotify(t('hr:notification'), t('Must have only one correct answer!'), 'error');
                return;
            }

            //multiple choice
            if (this.state.input_type == 2 && count == 1) {
                showNotify(t('hr:notification'), t('Must have more than one correct answer!'), 'error');
                return;
            }

            let response = await updateAnswer(id, {
                ...formData,
                answer_id: formData['id']
            });
            if (response.status == 1) {
                showNotify(t('hr:notification'), t('hr:update_susscess'));
            } else {
                showNotify(t('hr:notification'), response.message, 'error');
                return;
            }
        }

        let answerList = this.state.answerList.slice();
        answerList[selectedAnswerIndex] = formData;
        this.setState({
            answerList,
            isAdding: true,
            selectedAnswerIndex: null
        });
        this.resetAnswerForm();
    }

    /**
     * @event submitForm
     */
    async submitForm(values) {
        let { t } = this.props;
        values.document_id = typeof values.document_id != 'undefined' ? values.document_id : 0;
        let data = { ...values, title: 'title' };
        data['content'] = this.state.content;
        let { id } = this.props.match.params;
        let response;
        if (id) {
            //check type of question
            data['answer'] = this.state.answerList;
            const { answer = [], input_type } = data;
            let count = 0;
            answer.map((item) => {
                if (item.is_correct == 1) {
                    count++;
                }
            });

            if (count == 0) {
                showNotify(t('hr:notification'), t('Must have at least one correct answer!'), 'error');
                return;
            }

            //one choice
            if (input_type == 1 && count != 1) {
                showNotify(t('hr:notification'), t('Must have only one correct answer!'), 'error');
                return;
            }

            //multiple choice
            if (input_type == 2 && count == 1) {
                showNotify(t('hr:notification'), t('Must have more than one correct answer!'), 'error');
                return;
            }

            response = await updateQuestion(id, data);
            if (response.status == 1) {
                showNotify(t('hr:notification'), t('hr:update_susscess'));
            } else {
                showNotify(t('hr:notification'), response.message, 'error');
            }
        } else {
            data['answer'] = this.state.answerList;
            const { answer = [], input_type } = data;
            let count = 0;
            answer.map((item) => {
                if (item.is_correct == 1) {
                    count++;
                }
            });

            if (count == 0) {
                showNotify(t('hr:notification'), t('hr:must_have_at_least_one_correct_answer'), 'error');
                return;
            }

            //one choice
            if (input_type == 1 && count != 1) {
                showNotify(t('hr:notification'), t('hr:must_have_only_one_correct_answer'), 'error');
                return;
            }

            //multiple choice
            if (input_type == 2 && count == 1) {
                showNotify(t('hr:notification'), t('hr:must_have_more_than_one_correct_answer'), 'error');
                return;
            }

            response = await createQuestion(data);
            if (response.status == 1) {
                showNotify(t('hr:notification'), t('Question created!'));
                return redirect('/company/trainning-question');
            } else {
                showNotify(t('hr:notification'), response.message, 'error');
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
                ((checkPermission('hr-trainning-question-update') && this.state.data?.status != 1)
                    ||
                    (checkPermission('hr-trainning-question-approve') && this.state.data?.status == 1))
                    ?
                    <Button type="primary" htmlType="submit"
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={this.onAddAnswer.bind(this)}
                    > &nbsp;{t('hr:add_new')}</Button >
                    : ''
            );
        } else {
            return (
                <>
                    <Button type="primary" htmlType="submit" className="mr-2"
                        icon={<FontAwesomeIcon icon={faSave} />}
                        onClick={this.onEditAnswer.bind(this)}
                    >&nbsp;{t('hr:update')}</Button>
                    <Button type="primary" htmlType="submit"
                        icon={<FontAwesomeIcon icon={faTimes} />}
                        onClick={this.onCancelEditAnswer.bind(this)}
                        ghost={true}>&nbsp;{t('hr:cancel')}</Button>
                </>
            );
        }

    }

    /**
    * @render
    */
    render() {
        let { t, match } = this.props;
        let id = match.params.id;
        const columns = [
            {
                title: 'No.',
                align: 'center',
                render: r => this.state.answerList.indexOf(r) + 1
            },
            {
                title: t('hr:answer'),
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
                            ((checkPermission('hr-trainning-question-update') && this.state.data?.status != 1)
                                ||
                                (checkPermission('hr-trainning-question-approve') && this.state.data?.status == 1))
                                ?
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
                                ((checkPermission('hr-trainning-question-update') && this.state.data?.status != 1)
                                    ||
                                    (checkPermission('hr-trainning-question-approve') && this.state.data?.status == 1))
                                    ?
                                    <Button type="primary" size='small' style={{ marginLeft: 8 }} icon={<FontAwesomeIcon icon={faTrash} />} />
                                    : ''
                            }
                        </Popconfirm>
                    </>
                )
            }
        ];

        let subTitle = '';
        let disableField;
        if (id) {
            subTitle = t('hr:update');
            disableField = true;
        } else {
            subTitle = t('hr:add_new');
        }
        return (
            <>
                <PageHeader title={t('Trainning Question')} subTitle={subTitle} />
                <Row >
                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                        <Row className='card mr-1 p-3 pt-0'>
                            <PageHeader title={t('hr:question')} className="p-0" />
                            <Form ref={this.formRef} name="upsertForm"
                                className="ant-advanced-search-form " layout="vertical"
                                onFinish={this.submitForm.bind(this)}>
                                <Row>
                                    <Col span={24}>
                                        <ReactQuill style={{ height: 200, marginBottom: 40 }} value={this.state.content} onChange={(value) => this.setState({ content: value })} />
                                    </Col>
                                </Row>
                                <Row style={{ marginTop: 10 }} gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12} key='question_type'>
                                        <Form.Item name="type" label={t('Question Type')}>
                                            <Dropdown datas={trainingExamTypes}
                                                defaultOption="-- Choose Type --"
                                                onChange={(type) => {
                                                    this.formRef.current.resetFields(['input_type'])
                                                    this.setState({ type })
                                                }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12} key='code'>
                                        <Form.Item name="code" label={t('hr:code')} rules={[{ required: true, message: t('Please input question code!') }]} hasFeedback>
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>

                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} key='input_type'>
                                        <Form.Item name="input_type" label={t('Input Type')}>
                                            <Dropdown datas={this.state.type == 1 ?
                                                trainingQuestionInputTypesTheory
                                                : trainingQuestionInputTypesPractice}
                                                defaultOption="-- Choose Input Type --"
                                                onChange={(input_type) => this.setState({ input_type })}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} key='is_required'>
                                        <Form.Item name="is_required" label={t('Is Required?')}>
                                            <Dropdown datas={basicStatus} defaultZero />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} key='is_upload'>
                                        <Form.Item name="is_upload" label={t('Is Upload ?')}>
                                            <Dropdown datas={basicField} defaultZero />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12} key='status'>
                                        <Form.Item name="status" label={t('hr:status')} rules={[{ required: true, message: t('Please choose status!') }]} hasFeedback>
                                            <Dropdown datas={staffStatus} defaultOption="-- Choose Status --" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6} key='level'>
                                        <Form.Item name="level" label={t('hr:level')} rules={[{ required: true, message: t('Please choose level!') }]} hasFeedback>
                                            <Dropdown datas={trainingQuestionLevels} defaultOption="-- Choose Level --" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                                        <Form.Item name="document_id" label={t('hr:document')}>
                                            {/* <DocumentDropDown   defaultOption="-- All Documents --"/> */}
                                            <Dropdown datas={this.state.documentList} defaultOption="-- Choose document --" onSearch={this.onSearchDocument.bind(this)} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24} className="pt-3">
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} key='bnt-submit'>
                                        {
                                            //nếu chưa active check quyền edit , active check quyền approve
                                            ((checkPermission('hr-trainning-question-update') && this.state.data?.status != 1)
                                                ||
                                                (checkPermission('hr-trainning-question-approve') && this.state.data?.status == 1))
                                                ?
                                                <Button htmlType="submit" type="primary" loading={this.state.loading}
                                                    icon={<FontAwesomeIcon icon={faSave} />}
                                                    onClick={this.enterLoading.bind(this)}>
                                                    &nbsp;{t('hr:save')}
                                                </Button>
                                                : ''
                                        }
                                    </Col>
                                    <Col xs={23} sm={12} md={12} lg={12} xl={12} key='btn-back' style={{ textAlign: "right" }}>
                                        <Link to={`/company/trainning-question`}>
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
                            {this.state.input_type != 3 ? (
                                <>
                                    <Table dataSource={this.state.answerList} columns={columns}
                                        rowKey={r => uniqueId()}
                                        pagination={{ pageSize: 20, hideOnSinglePage: true }} />
                                    <Form ref={this.answerFormRef} name="supsertForm" className="ant-advanced-search-form mt-2" layout="vertical">
                                        <Row >
                                            <Col xs={24} sm={24} md={24} lg={16} xl={16}>
                                                <Form.Item name="id" hidden >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item name="content">
                                                    <Input placeholder={('Answer')} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                                <Row align='center' >
                                                    <Form.Item name="is_correct"  >
                                                        <Dropdown datas={basicStatus} defaultZero />
                                                    </Form.Item>
                                                </Row>
                                            </Col>
                                            <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                                {this.renderBtnAction()}
                                            </Col>
                                        </Row>
                                    </Form>
                                </>
                            ) : [<p><b>Text Question. Need no answer choice!</b></p>]}

                        </Row>
                    </Col>
                </Row>
            </>
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
export default connect(mapStateToProps)(withTranslation()(TrainningQuestionForm));