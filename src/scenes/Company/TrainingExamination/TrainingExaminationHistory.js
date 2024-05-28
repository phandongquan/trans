import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Row, Descriptions, Col, Input, Form, Divider,  Modal, Spin } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Dropdown from '~/components/Base/Dropdown';
import { faSave, faCheck, faQuestion, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { trainingExamTypes, trainingExamResults, arrMimeType, screenResponsive  , majorISO, majorAreaManager } from '~/constants/basic';
import { showNotify, redirect, checkPermissionCommentTraningExam, checkISO, checkManager, checkManagementArea, checkPermission } from '~/services/helper';
import { history as getExamHistory, updateResult, approveLevel, generateQuestion as apiGenerateQuestion, UnApproveLevel } from '~/apis/company/trainingExamination/staff';

import ListQuestion from '~/components/Company/TrainingExamination/ListQuestion';
import './config/TrainingExaminationHistory.css';
import { EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import TrainingExamComment from './TrainingExamComment';
import StaffComment from './StaffComment'
import UploadMultiple from '~/components/Base/UploadMultiple';
import { createComment } from '~/apis/company/trainingExamination/comment';
import dayjs from 'dayjs';
class TrainingExaminationHistory extends Component {
    /**
     *
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.uploadRef = null;
        this.commentRef = null;
        this.state = {
            loading: false,
            examData: null,
            visible: false,
            visibleComment: false,
            comment: '',
            commentData: null,
            visibleUnapprove: false,
            commentModal: '',

        };
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        let { id } = this.props.match.params;
        if (id) {
            this.getHistory(id);
        }
    }

    /**
     * Request detail and set form value
     * @param {integer} id 
     */
    async getHistory(id) {
        let response = await getExamHistory(id);
        if (response.status == 1 && response.data) {
            let { data } = response;
            /**
             * Update examData and set examination_result
             */
            this.setState({ examData: data, comment: data?.detail.note || '' }, () => {
                let { detail } = data;
                this.formRef.current.setFieldsValue({ examination_result: detail.examination_result })
            });
        } else {
            this.backToExamList('Model not found!');
        }
    }

    /**
     * Redirect to Training Examation List
     * @param {*} message 
     */
    backToExamList(message = '') {
        let { t } = this.props;
        if (message) {
            showNotify(t('Notification'), t('message'), 'error');
        }
        redirect('/company/training-examination');
    }

    /**
     * @event submitForm
     */
    async submitForm(values) {
        let { t, match } = this.props;
        let { id } = match.params;
        if(this.state.comment.length){
            let response = await updateResult(id, values);
            if (response.status) {
                this.getHistory(id)
                showNotify(t('Notification'), t('Reusult updated!'),);
            } else {
                showNotify(t('Notification'), response.message, 'error');
            }
        }else{
            showNotify('Notification' , 'Vui lòng nhập nhận xét!', 'error');
            setTimeout(() => {
                window.location.reload()
              }, 1000); 
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
     * approve skill level 
     */
    onApproveLevel = () => {
        let { t } = this.props;
        let { id } = this.props.match.params;
        let params = {
            exam_staff_id: id
        }
        let xhr = approveLevel(params)
        xhr.then(response => {
            if (response.status == 1) {
                this.getHistory(id);
                this.setState({ visible: false });
                showNotify(t('Notification'), t('Level skill approved!'),);
            } else {
                showNotify(t('Notification'), response.message, 'error');
            }
        })
    }

    /**
     * Generate question
     */
    generateQuestion = async () => {
        let { t } = this.props;
        let { id } = this.props.match.params;
        let params = {
            exam_staff_id: id
        }
        let response = await apiGenerateQuestion(params);
        if (response.status) {
            showNotify(t('Notification'), t('Generate question success'));
            this.getHistory(id);
        } else {
            showNotify(t('Notification'), response.message, 'error');
        }
    }
    async submitFormUnApprove() {

        let values = this.uploadRef.getValues();
        let formData = new FormData();
        let { id } = this.props.match.params;
        if (this.state.commentModal) {
            formData.append('content', this.state.commentModal)
            formData.append('object_id', id)
            formData.append('object_type', 5)
            let params = {
                exam_staff_id: id
            }
            if (values.fileList.length) {
                (values.fileList).map(n => {
                    if (n.uid.includes('upload')) {
                        formData.append('files[]', n)
                    }
                })
            }
            let responseComment = await createComment(formData)
            let responseUnApprove = await UnApproveLevel(params)
            if (responseComment.status && responseComment.status) {
                showNotify('Notification', 'Unapprove thành công !')
                this.getHistory(id)
                this.commentRef.getListComments()
                this.setState({ visibleUnapprove: false });
            }
            else {
                showNotify(('Notification'), responseUnApprove.message, 'error');
            }
        } else {
            showNotify('Notification', 'Bạn chưa nhập lý do !', 'error')
            return

        }

    }
    /**
     * @render
     */
    render() {
        let { examData, visibleComment, comment, commentData } = this.state;
        if (!examData) {
            return [];
        }
        let { t, auth: { staff_info } } = this.props;
        let { id } = this.props.match.params;

        let { detail, questions } = examData;
        let answerData = detail.examination_data ? JSON.parse(detail.examination_data) : {};

        let subTitle = t('hr:history_exam');

        let checkTimeApprove = examData.detail?.examination_result != 1 && (examData.detail?.approved_by && examData.detail?.unapproved_by) && (dayjs(examData.detail?.approved_at) < dayjs(examData.detail?.unapproved_at));
        let checkTimeUnApprove = !((dayjs(examData.detail?.approved_at) < dayjs(examData.detail?.unapproved_at)));

        return (
            <>
                <PageHeader title={t('hr:training_exam')} subTitle={subTitle} />
                <Spin spinning={this.state.loading}>
                    <Row className='card p-2 pt-0 pb-0'>
                        <Form ref={this.formRef} name="detailForm" className="ant-advanced-search-form"
                            layout="vertical" onFinish={this.submitForm.bind(this)} >
                            <Row className='pt-3'>
                                <Col xs={24} sm={24} md={24} lg={2} xl={2} className='pr-2'>
                                    <Form.Item name="examination_result">
                                        <Dropdown datas={trainingExamResults} />
                                    </Form.Item>
                                </Col>
                                {typeof examData.number_of_questions == 'undefined' && (checkISO(staff_info.major_id) || checkManager(staff_info.position_id)) ?
                                    <Col xs={24} sm={24} md={24} lg={5} xl={5} className='pr-2'>
                                         <Form.Item> 
                                            <Button type="primary" block icon={<FontAwesomeIcon icon={faQuestion} />}
                                            onClick={() => this.generateQuestion()}>
                                            &nbsp;{t('hr:generate_question')}
                                            </Button>
                                        </Form.Item>

                                    </Col>
                                    :
                                    <>
                                        {
                                            !examData.detail?.examination_result
                                                ||
                                                ((examData.detail?.examination_result && !examData.detail?.approved_by && !examData.detail?.unapproved_by)
                                                    ||
                                                    (examData.detail?.examination_result && !checkTimeUnApprove)) ?
                                                !(this.props.staffInfo.major_id == 9 &&
                                                    this.props.staffInfo.staff_loc_id == this.state.examData.detail.staff.staff_loc_id) ?
                                                    (checkPermission('hr-examination-result-detail-update') ?
                                                        (<Col xs={24} sm={24} md={24} lg={5} xl={5} className='pr-2'>
                                                            <Form.Item>
                                                                {
                                                                    <Button type="primary" block icon={<FontAwesomeIcon icon={faSave} />} htmlType="submit"
                                                                        onClick={this.enterLoading.bind(this)}>
                                                                        &nbsp;{t('hr:update')}
                                                                    </Button>
                                                                }
                                                            </Form.Item>
                                                        </Col>)
                                                        : "")
                                                    : ""
                                                : []
                                        }

                                        {/* <Col xs={24} sm={24} md={24} lg={6} xl={6} className='pr-2'>
                                            {((((examData.detail?.examination_result != 1 && !examData.detail?.approved_by) || checkTimeApprove)) && (checkManagementArea(staff_info.major_id) || (checkManager(staff_info.position_id) || checkISO(staff_info.major_id)))) ?
                                                checkPermission('hr-examination-result-detail-update') ?
                                                (<Form.Item>
                                                    <Button type='primary' onClick={() => this.setState({ visible: true })}
                                                        icon={<FontAwesomeIcon icon={faCheck} />}>&nbsp;Approve level skill
                                                    </Button>
                                                </Form.Item>) : ""
                                                : 
                                                ''} 
                                             {((((examData.detail?.examination_result == 2 && examData.detail?.approved_by) && checkTimeUnApprove)) && checkManagementArea(staff_info.major_id)) ? 
                                                <Form.Item>
                                                    <Button className='ml-1' type='danger' onClick={() => this.setState({ visibleUnapprove: true })}
                                                        icon={<FontAwesomeIcon icon={faMinusCircle} />}>&nbsp;Un Approve level skill
                                                    </Button>
                                                </Form.Item>
                                                 : []
                                            } 
                                        </Col> */}

                                    </>
                                }
                            </Row>
                        </Form>
                    </Row>
                    <Row className='card mt-1 p-3 pt-0'>
                        <Descriptions title={t('hr:general_informaion')} className="pt-2" size="small" column={2}>
                            {
                                examData?.skill ? <Descriptions.Item label={t('hr:staff')}>{examData.skill.name}</Descriptions.Item> : []
                            }
                            <Descriptions.Item label={t('hr:staff')}>{detail?.staff?.staff_name} &nbsp; <strong>#{detail?.staff?.code}</strong></Descriptions.Item>
                            <Descriptions.Item label={t('hr:examnation_type')}> {examData.examination ? trainingExamTypes[examData.examination.type] : trainingExamTypes[examData.type]}</Descriptions.Item>
                            <Descriptions.Item label={t('hr:start_at')}>{detail && detail.start_at}</Descriptions.Item>
                            <Descriptions.Item label={t('hr:duration')}>{examData.duration && `${examData.duration} minutes`}</Descriptions.Item>
                            <Descriptions.Item label={t('hr:end_date')}>{detail && detail.end_at}</Descriptions.Item>
                            <Descriptions.Item label={t('hr:num_of_ques')}>{answerData.totalQuestion || examData.number_of_questions}</Descriptions.Item>
                            <Descriptions.Item label={t('hr:correct_answer')}>{answerData.totalCorrectAnswer}</Descriptions.Item>
                            <Descriptions.Item label={t('hr:doc_ver')}>{examData?.document_version}</Descriptions.Item>
                        </Descriptions>
                    </Row>
                    <Row className='card mt-1 p-3 pt-0'>
                        <ListQuestion data={examData} cbReloadData={() => this.getHistory(id)} />
                        <Divider className="mt-1 mb-2" />
                        {/* <BackButton url={`/company/training-examination/${examData.id}/edit`} /> */}
                    </Row>
                    <Row className='card mt-1 p-3 pt-0'>
                        <div style={{ fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>
                            Nhận xét: <span style={{color : 'red'}}>*</span>
                            {/* {(checkPermissionCommentTraningExam(staff_info.position_id) || checkISO(staff_info.major_id)) ?
                                <Button
                                    className={`ml-2 ${visibleComment ? 'd-none' : ''}`}
                                    type='primary' icon={<EditOutlined />}
                                    onClick={() => this.setState({ visibleComment: true })}
                                >Edit</Button>
                                : ''} */}
                        </div>
                        {/* <div
                            className={visibleComment ? 'd-none' : ''}
                            style={{ lineHeight: '1.4', whiteSpace: 'pre-wrap' }}
                            dangerouslySetInnerHTML={{ __html: comment }}
                        /> */}
                        {/* <div className={!visibleComment ? 'd-none' : ''}> */}
                            <TrainingExamComment
                                examData={examData}
                                toggleVisible={value => this.setState({ visibleComment: value })}
                                cbSubmit={value => this.setState({ comment: value })}
                            />
                        {/* </div> */}
                    </Row>
                    <Row className='card mt-1 p-3 pt-0'>
                        <div className={''}>
                            <StaffComment
                                onRef={ref => { this.commentRef = ref }}
                                object_id={examData.detail.id}
                                commentData={commentData}
                                cbSubmit={value => console.log({ 123: value })}
                                cbReloadData={() => { }}
                            />
                        </div>
                    </Row>
                    <Modal
                        open={this.state.visible}
                        width= {window.innerWidth < screenResponsive  ? '100%' : '20%'}
                        onCancel={() => this.setState({ visible: false })}
                        onOk={() => this.onApproveLevel()}
                    ><QuestionCircleOutlined style={{ color: 'red', paddingRight: '3px' }} />Bạn có muốn approve level skill không ?</Modal>
                    <Modal
                        title={'Nhập lý do'}
                        open={this.state.visibleUnapprove}
                        width= {window.innerWidth < screenResponsive  ? '100%' : '50%'}
                        onCancel={() => this.setState({ visibleUnapprove: false })}
                        onOk={() => this.submitFormUnApprove()}
                    >
                        <div className='ml-2 mb-1'>
                            <Input.TextArea autoSize={{ minRows: 5 }} placeholder='Viết lý do'
                                onChange={value => this.setState({ commentModal: value.target.value })}
                            />
                        </div>

                        <UploadMultiple
                            onRef={ref => { this.uploadRef = ref }}
                            type={arrMimeType}
                            size={100}
                        />
                    </Modal>
                </Spin>
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
    };
}
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TrainingExaminationHistory));