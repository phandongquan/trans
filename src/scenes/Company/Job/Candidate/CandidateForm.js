import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Col, Spin, Form, Input, Modal } from 'antd';
import { getListMembers as apiMembers} from '~/apis/company/job/member';
import Dropdown from '~/components/Base/Dropdown';
import { skillStatus as arrStatus } from '~/constants/basic';
import { convertToFormData, showNotify } from '~/services/helper';
import { getList as apiJobs } from '~/apis/company/job';
import { create as apiCreate,  detail as apiDetail, update as apiUpdate} from '~/apis/company/job/candidate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes} from '@fortawesome/free-solid-svg-icons';
import Upload from '~/components/Base/Upload';
import {screenResponsive} from '~/constants/basic';
class CandidateForm extends Component {

    /**
     * @lifecycle
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            file: [],
            defaultFile: []
        }
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.getJobs();
        this.getListMembers()

        let { jobID, memberId } = this.props;
        this.formRef.current.setFieldsValue({
            job_id: jobID,
            status: 1,
            mid: memberId
        });
        
        let { candidateID } = this.props;
        if(candidateID) {
            this.getDetailCandidate(candidateID);
        }
    }

    /**
     * Call api get jobs
     */
    async getJobs() {
        this.setState({ loading: true })
        let response = await apiJobs();
        if(response.status) {
            this.setState({ loading: false })
            let jobs = response.data.rows;
            if(jobs) {
                let result = [];
                jobs.map(job =>{
                    result.push({ id: job.id, title: ` [${ job.code }] ${ job.title } `})
                })
                this.setState({ jobs: result })
            }
        }
    }

    /**
     * Call api get list members by job except member applied
     */
    async getListMembers() {
        this.setState({ loading: true })

        let response = await apiMembers({ status: 1 });
        if(response.status) {
            this.setState({ loading: false })
            let members = response.data.rows;
            if(members) {
                let result = [];
                members.map(member =>{
                    result.push({ id: member.id, title: member.fullname })
                })
                this.setState({ members: result })
            }
        }
    }
    
    /**
     * Call api get detail candidate
     * @param {*} id 
     */
    getDetailCandidate(id) {
        let xhr = apiDetail(id);
        xhr.then(response => {
            if(response.status) {
                let { candidate } = response.data;
                if(candidate) {
                    if(candidate.member) {
                        this.setState({ members: [{ id: candidate.member.id, title: candidate.member.fullname }]})
                    }
                    this.setState({
                        defaultFile: [
                            {
                                uid: '1',
                                name: candidate.attach_file,
                                status: 'done',
                                url: candidate.attach_file
                            }
                        ]
                    })
                    this.formRef.current.setFieldsValue(candidate)
                }
            }
        })
    }

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
     * @event sumbit Form
     */
    submitForm = (values) => {
        this.setState({ loading: true })
        let { t } = this.props;
        let id = this.props.candidateID;
        let xhr, message;

        values = {
            ...values,
            owner: 1
        }

        // Remove field have value in array ['undefined','null']
        Object.keys(values).map( key => {
            if(values[key] === undefined || values[key] === null) {
                delete values[key]
            }
        })

        let dataForm = convertToFormData(values);
        dataForm.append('Upload[attach_file]', this.state.file[0]);
        if(id) {
            xhr = apiUpdate( id, dataForm);
            dataForm.append('_method', 'PUT');
            message = t('Updated candidate');
        } else {
            xhr = apiCreate(dataForm);
            message = t('Created candidate');
        }
        xhr.then(response => {
            if(response.status) {
                if(this.props.memberId) {
                    this.props.applied();
                    this.setState({ loading: false});
                    this.props.hidePopup();
                } else {
                    this.setState({ loading: false})
                    showNotify('Notification', message, 'success', 1.5 , this.props.hidePopup);
                }
            } else {
                this.setState({ loading: false })
                showNotify(t('Notification'), response.message, 'error');
            }
        })
    }

    /**
     * Handle event onChange dropdown job
     * @param {*} id 
     */
    handleChangeJob(id) {
        this.getListMembers(id)
    }
    
    render() {
        let { t } = this.props;
        let id = this.props.candidateID;
        let title;
        if(id) {
            title=t('hr:edit')
        } else {
            title=t('hr:add')
        }

        return (
            <>
            <Modal
                forceRender
                title={title}
                open={this.props.visible}
                onCancel={this.props.hidePopup}
                okText={t("submit")}
                cancelText={t("cancel")}
                onOk={ values => this.handleFormSubmit(values)}
                width= {window.innerWidth < screenResponsive  ? '100%' : '40%'}>
                    <Spin spinning={ this.state.loading }>
                        <Form ref={this.formRef}
                            className="ant-advanced-search-form"
                            layout="vertical"
                        >
                            <Row gutter={24}>
                                <Col span={24}>
                                    <Form.Item
                                        label={t('hr:job')}
                                        name='job_id'
                                        hasFeedback
                                        rules={[{ required: true, message: t('hr:select_job') }]}
                                    >
                                        <Dropdown datas={this.state.jobs} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={24}>
                                <Col span={24}>
                                    <Form.Item
                                        label={t('member')}
                                        name='mid'
                                        hasFeedback
                                        rules={[{ required: true, message: t('hr:select_member') }]}
                                    >
                                        <Dropdown datas={this.state.members} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={24}>
                                <Col span={24}>
                                    <Form.Item label={t('hr:status')} name='status' >
                                        <Dropdown datas={{1: 'Pending'}} disabled />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={24}>
                                <Col span={24}>
                                    <Form.Item label={t('hr:note')} name='note' >
                                        <Input.TextArea rows={3} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={24}>
                                <Col span={24}>
                                    <Form.Item
                                        label={t('hr:attchment')}
                                        valuePropName="fileList"
                                        extra={t('hr:support_file_png_jpg_jpeg') + "."  + t('hr:max_2mb')}>
                                        <Upload
                                            defaultFileList={this.state.defaultFile}
                                            onChange={(value) => this.setState({ file: value })}
                                            onRemove={(value) => this.setState({ file: value })}
                                            type={['application/pdf']}
                                            size={2}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Spin>
                </Modal>
            </>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(CandidateForm));