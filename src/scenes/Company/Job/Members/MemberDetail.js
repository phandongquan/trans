import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Col, Avatar, Divider, Button, Tabs, Table, Menu, Spin, Rate, Modal, Image, Popconfirm, Card, Radio, Tooltip } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { detail as apiDetail } from '~/apis/company/job/member';
import { UserOutlined, RollbackOutlined, LoginOutlined, QuestionCircleOutlined, CopyOutlined } from '@ant-design/icons';
import { genders, dateTimeFormat, jobCandidateStatus, jobUnit, typeReasonReject } from '~/constants/basic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faHome, faPen, faTransgender } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { convertToFormData, parseIntegertoTime, showNotify, timeFormatStandard } from '~/services/helper';
import { getList as apiGetListCandidates, update as apiUpdate, detail as apiDetailCandidate, interviewSendMailCreate, getMailThanks, sendMailThanks, getListLogSendMail as apiGetListLogSendMail , interviewSendMailOfferCreate } from '~/apis/company/job/candidate';
import { getList as apiGetListBasic } from '~/apis/company/job/basic';
import { create as apiCreateStaff } from '~/apis/company/staff/temp';
import CandidateForm from '~/scenes/Company/Job/Candidate/CandidateForm';
import dayjs from 'dayjs';
import Dropdown from '~/components/Base/Dropdown';
import './config/memberdetail.css';
import { screenResponsive } from '~/constants/basic';
import { getLinkTest, initQuestion } from '~/apis/company/job/spectific';
import ListQuestion from '~/scenes/Company/Job/Members/ListQuestion';
import ModalForm from './ModalForm';
import InterviewResult from './InterviewResult';
import { WS_URL_TUYENDUNG } from '~/constants';
import ModalFormReject from './ModalFormReject';
class MemberDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            visiblePopup: false,
            visiblePopupReason: false,
            member: null,
            candidate: null,
            candidates: [],
            workflows: {},

            cities: {},
            levels: {},
            degrees: {},

            job_apply_id: 0,
            department_id: 0,
            division_id: 0,
            major_id: 0,
            typeReason: null,
            // valueWfid : null ,
            testResult: null,
            activeKey: 'summary',
            visibleFormEmail: false,

            visibleFormEmailReject: false,
            objectMailReject: null,
            datasLogSendMail : [],
            dataLogSendMail : {}
        }
    }

    componentDidMount() {
        let { id, job_apply_id } = this.props.match.params;
        this.getBasic();
        this.getMemberDetail(id);
        this.getCandidates(id);

        if (job_apply_id) {
            this.setState({ job_apply_id: job_apply_id })
            this.getCandidateDetail(job_apply_id)
        }
    }
    async getListLogSendMail(job_id){
        let { job_apply_id } = this.props.match.params;
        let params = {
            job_id : job_id,
            candidate_id: job_apply_id
        }
        let response = await apiGetListLogSendMail(params)
        if(response.status){
            this.setState({datasLogSendMail : response.data.rows})
        }
    }
    async getBasic() {
        let response = await apiGetListBasic();
        if (response.status) {
            let { data } = response;
            this.setState({ workflows: data.workflows, cities: data.locations, levels: data.levels, degrees: data.degrees })
        }
    }

    async getMemberDetail(id, params = {}) {
        let response = await apiDetail(id, params);
        if (response.status) {
            this.setState({ member: response.data.member })
        }
    }

    async interviewSendMail(params = {}) {
        let { baseData: { locations } } = this.props
        let { member, testResult, candidate } = this.state;
        let wfid = candidate?.wfid;
        let { exam_id } = testResult?.info || {};
        if (!exam_id) {
            showNotify('Thông báo', 'Chưa có bài test', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('job_title', member?.resume_title);
        formData.append('jobseeker_name', member?.fullname);
        formData.append('jobseeker_email', params?.email);
        formData.append('interview_date', timeFormatStandard(params?.date, dateTimeFormat));
        formData.append('interviewer_name', params?.interviewer);
        formData.append('interview_address', locations.find(l => l.id == params.location)?.address);
        formData.append('mail_title', params?.mail_title);
        formData.append('mail_content', params?.note);
        formData.append('candidate_id', candidate?.id);
        formData.append('interviewer_id', params?.interviewer_id);
        formData.append('interview_address_id', params?.location);

        if (wfid == 5 || wfid == 3 ) {
            if (params.attachments.length) {
                params.attachments.map((item, index) => {
                    formData.append(`JobTestExams[offer_letters][]`, item);
                })
            }

            await interviewSendMailOfferCreate(exam_id, formData);
        } else {
            await interviewSendMailCreate(exam_id, formData);
        }

        this.setState({ visibleFormEmail: false })
        showNotify('Thông báo', 'Gửi mail thành công', 'success');
    }

    async sendMailThanks(params = {}) {
        let { member, testResult, candidate } = this.state;
        let { exam_id } = testResult?.info || {};
        if (!exam_id) return;

        let data = {
            job_title: member?.resume_title,
            jobseeker_name: member?.fullname,
            jobseeker_email: member?.email,
            mail_title: params?.mail_title,
            mail_content: params?.note,
            candidate_id: candidate?.id,
        }

        let response = await sendMailThanks(data, exam_id);
        this.setState({ visibleFormEmailReject: false })
        showNotify('Thông báo', 'Gửi mail thành công', 'success');
    }

    async getCandidateDetail(id) {
        let response = await apiDetailCandidate(id);
        if (response.status) {
            let { candidate } = response.data;
            this.checkCandidate(candidate);
            this.setState({
                department_id: candidate.department_id,
                division_id: candidate.division_id,
                major_id: candidate.major_id,
                typeReason: candidate?.reason ? candidate?.reason : null
            }, () => {
                const { job_id } = candidate;
                if (!job_id) return;
                this.genTestExamination(job_id);
                this.getListLogSendMail(job_id)
            })
        }
    }

    async getCandidates(id) {
        let response = await apiGetListCandidates({ mid: id })
        if (response.status) {
            this.setState({ candidates: response.data.rows, valueWfid: response.data.rows.wfid })
        }
    }

    processCandidate() {
        const { testResult } = this.state;
        const { candidate } = testResult;

        if (!candidate.length) {
            return [];
        }

        let newQuestions = candidate.map((item, index) => {
            const { answers = [] } = item;
            return {
                ...item,
                detail: answers.map((answers, index) => {
                    return {
                        ...answers,
                        is_correct: answers.is_correct ? 1 : 0
                    }
                })
            }
        });

        return newQuestions;
    }

    async handleWorkflowClick(value, type) {
        let { member } = this.state;
        this.setState({ loading: true })
        let formData = new FormData();
        formData.append('_method', 'PUT');
        if (type == 'rating')
            formData.append('rating', value);
        if (type == 'workflow') {
            formData.append('wfid', value);
        }
        // if (type == 'workflow' && value == 4) {
        //     let datas = {
        //         staff_name: member.fullname,
        //         staff_email: member.email,
        //         staff_phone: member.phone,
        //         staff_address: member.address,
        //         gender: member.gender,
        //         staff_dob: member.birthday ? dayjs(member.birthday, 'YYYY.MM.DD').unix() : 0,
        //         staff_dept_id: this.state.department_id,
        //         division_id: this.state.division_id,
        //         major_id: this.state.major_id,
        //         staff_status: 1
        //     }

        //     let response = await apiCreateStaff(datas);
        //     if (!response.status) {
        //         this.setState({ loading: false })
        //         showNotify('Tuyển dụng thất bại!', response.message, 'error');
        //         return false;
        //     }

        //     formData.append('wfid', value);
        // }

        let response = await apiUpdate(this.state.job_apply_id, formData);
        if (response.status) {
            let { candidate } = response.data;
            this.checkCandidate(candidate);
            this.setState({ loading: false })
            showNotify('Updated candidate');
        }
    }

    checkCandidate(candidate) {
        this.setState({ candidate: candidate })
        return true;
    }

    async onChangeStatusCandidate(values, type = 'reject') {
        if (type == 'apply_for_another_position') {
            await this.togglePopup(true);
        }
    }

    async updateCandidate(id, data) {
        this.setState({ loading: true })
        let formData = convertToFormData(data);
        formData.append('_method', 'PUT');
        let response = await apiUpdate(id, formData);
        if (response.status) {
            this.getCandidateDetail(id);
            showNotify('Updated candidate');
            await this.setState({ loading: false, visiblePopupReason: false })
        }
    }

    async getLinkTest(exam_id) {
        let response = await getLinkTest(exam_id);

        const copyLink = () => {
            let copyText = document.getElementById("link_test");
            copyText.select();
            document.execCommand("copy");
        }

        if (response.status) {
            let { data } = response;
            if (data) {
                Modal.info({
                    title: 'QR Code',
                    width: '45%',
                    content: (
                        <div>
                            <img className='image_qr_code' src={`https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${data}`} alt='' />
                            <a href={data}>{data}</a>{" "}
                            <Tooltip title="Copy link">
                                <CopyOutlined onClick={copyLink} />
                            </Tooltip>
                        </div>
                    ),
                    onOk() { },
                });
            }
        }
    }

    /**
     * Call api 
     */
    appliedCandidateForAnotherPosition = () => {
        this.updateCandidate(this.state.job_apply_id, { status: 2 });
    }

    /**
     * Toggle Popup
     * @param {*} visible 
     */
    togglePopup(visible) {
        this.setState({ visiblePopup: visible })
    }

    async genTestExamination(job_id) {
        let { job_apply_id } = this.props.match.params;
        let response = await initQuestion({
            job_id: job_id,
            candidate_id: job_apply_id
        })

        if (response.status) {
            let { data } = response;
            let { rows } = data;
            this.setState({ testResult: rows })
        }
    }

    async getMailThank({ exam_id }) {
        let response = await getMailThanks({ exam_id: exam_id });
        if (response.status) {
            let { data } = response;
            let { rows } = data;
            this.setState({ objectMailReject: rows, visibleFormEmailReject: true })
        }
    }

    renderGeneralInformation = (info = {}) => {
        const { start_date, end_date, duration, num_of_question_candidate, correct_answer, test_result } = info;
        const { candidate, candidates } = this.state;
        const { resume_title } = candidate;

        let member_name = candidates[candidates.length - 1]?.member_name;
        let member_id = candidates[candidates.length - 1]?.member_id;

        const renderTestResult = (test_result = 0) => {
            let text = null
            switch (test_result) {
                case '1':
                    text = "Pass";
                    break;
                case '2':
                    text = "Failed";
                    break;
                default:
                    text = null;
                    break;
            }
            return text;
        }

        return <div className='general_information' >
            <div className='title mt-1 font-weight-bold'>General Information</div>
            <div className='content'>
                <div className='left'>
                    <p>Job Title: {resume_title}</p>
                    <p>Start at: {start_date}</p>
                    <p>Duration: {duration}</p>
                    <p>Number of questions: {num_of_question_candidate}</p>
                </div>
                <div className='right'>
                    <p>Candidate: {`${member_name} - ${member_id}`}</p>
                    <p>End at: {end_date}</p>
                    {test_result ? <p>Test result: {renderTestResult(test_result)}</p> : null}
                    {correct_answer ? <p>Correct answer: {correct_answer}</p> : null}
                </div>
            </div>
        </div>
    }
    renderWorkLocation(resume) {
        let { t, baseData: { locations } } = this.props;
        let arrWorkLocation = resume.work_locations
        if (arrWorkLocation.length) {
            let result = locations.filter(l => arrWorkLocation.includes(l.id.toString()));
            let names = result.map(item => item.address);
            return <span>{names.toString()}</span>
        } else {
            return <></>
        }

    }
    renderExperiences(resume) {
        let result = []
        let arrExperiences = resume.arrExperiences
        if (arrExperiences.length) {
            arrExperiences.map(exp => {
                let formattedText = exp.information.replace(/\r\n/g, "<br>");
                result.push(<Row gutter={24} className='mt-3'>
                    <Col span={12}>
                        <strong>Company name : </strong><br />
                        <span>{exp.company_name}</span>
                    </Col>
                    <Col span={12}>
                        <strong>Position name : </strong><br />
                        <span>{exp.position_name}</span>
                    </Col>
                    <Col span={24}>
                        <strong>Information : </strong><br />
                        <div
                            className=""
                            dangerouslySetInnerHTML={{
                                __html: formattedText
                            }}
                        />
                    </Col>
                </Row>)
            })
        }
        return <>{result}</>
    }
    render() {
        let { member, candidate, workflows, degrees, levels, cities, testResult, visibleFormEmail, visibleFormEmailReject, objectMailReject } = this.state;
        let { exam_id } = testResult?.info || {};
        let { t, baseData: { majors, locations }, match: { params } } = this.props;

        let resume = member;
        let industries = [];
        let arrCity = []
        if (resume) {
            majors.map(m => {
                if (resume.industries?.includes(String(m.id)))
                    return industries.push(m.name);
            })

            Object.keys(cities).map(c => {
                if (resume.locations?.includes(String(c)))
                    return arrCity.push(cities[c]);
            })
        }
        const columnsHistoryApply = [
            {
                title: t('No.'),
                render: r => this.state.candidates.indexOf(r) + 1
            },
            {
                title: t('Job Title'),
                render: r => <Link to={`/company/job/${r.job_id}/edit`}>{r.job_title}</Link>
            },
            {
                title: t('Workflow'),
                render: r => r.wfid && this.state.workflows[r.wfid]
            },
            {
                title: t('Rating'),
                render: r => <Rate value={r.rating} />
            },
            {
                title: t('Note'),
                dataIndex: 'note'
            },
            {
                title: t('Applied date'),
                render: r => r.created && parseIntegertoTime(r.created, dateTimeFormat)
            }
        ]
        const columnsLogSendMail = [
            {
                title: t('No.'),
                render: r => this.state.datasLogSendMail.indexOf(r) + 1
            },
            {
                title : t('Subject'),
                dataIndex : 'subject'
            },
            {
                title : t('To email'),
                dataIndex : 'to'
            },
            {
                title : t('Key'),
                dataIndex : 'key'
            },
            {
                title: t('Body'),
                width: '50%',
                render: r =>  <div
                    className="m-3"
                    dangerouslySetInnerHTML={{
                        __html: r.body
                    }}
                >
                </div>
            },
            {
                title : t('Created at'),
                dataIndex : 'created_at'
            }
        ]
        if (!member) return [];

        return (
            <div id='page_member_detail_job'>
                <PageHeader
                    title={t('Candidate Detail')}
                    subTitle={
                        <Link to={`/company/job/members/${member.id}/edit`} className='m-1'>
                            <Button type="primary" icon={<FontAwesomeIcon icon={faPen} />}>
                                &nbsp;Edit
                            </Button>
                        </Link>
                    }
                />
                <Spin spinning={this.state.loading}>
                    <div id='block_user_info' className='card p-3 mb-3'>
                        <Row>
                            <Col xs={24} sm={24} md={24} lg={2} xl={2} className='text-center'>
                                {
                                    this.state.member.avatar ?
                                        <div className='image-member'>
                                            <Image src={WS_URL_TUYENDUNG + this.state.member.avatar} />
                                        </div>
                                        :
                                        <Avatar size={{
                                            xs: 64,
                                            sm: 64,
                                            md: 64,
                                            lg: 64,
                                            xl: 80,
                                            xxl: 100,
                                        }} icon={<UserOutlined />} />
                                }


                            </Col>

                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                <div className='title_user mt-3 txt_20'><strong>{member.fullname} {member.identity && <small>( {member.identity} )</small>}</strong> </div>
                                {/* <div>{resume && resume.resume_title}</div> */}
                                {
                                    candidate && candidate.resume_title ?
                                    <div>{candidate.resume_title}</div>
                                    : 
                                    <div>{resume && resume.resume_title}</div>
                                }
                            </Col>

                            <Col xs={24} sm={24} md={24} lg={10} xl={10}>
                                {
                                    candidate ?
                                        <>
                                            <Row gutter={12} >
                                                <div className='ml-2 pb-1' style={{ backgroundColor: '#fff' }}>
                                                    <div className='pl-2 pr-2'>
                                                        Rating: <Rate value={candidate && candidate.rating} onChange={(e) => this.handleWorkflowClick(e, 'rating')} />
                                                    </div>
                                                </div>
                                            </Row>

                                            <Row gutter={24} className='m-1'>
                                                <strong>Current Workflow: &nbsp;&nbsp;</strong> {this.state.workflows[candidate.wfid]}
                                            </Row>
                                            <Row gutter={24} className='mt-1'>
                                                {
                                                    (candidate.status == 1 &&
                                                        candidate.wfid > 1) ?
                                                        <Col span={4}>
                                                            <Button shape="round"
                                                                icon={<RollbackOutlined />}
                                                                onClick={() => this.handleWorkflowClick(candidate.wfid - 1, 'workflow')}>
                                                                Back
                                                            </Button>
                                                        </Col>
                                                        : []
                                                }
                                                <Col xs={24} sm={24} md={24} lg={16} xl={16}>
                                                    <div className='d-flex'>
                                                        {
                                                            (candidate.status == 1) ?
                                                                (candidate.wfid < 4) ?
                                                                    <Button type='primary'
                                                                        shape="round"
                                                                        icon={<LoginOutlined />}
                                                                        onClick={() => this.handleWorkflowClick(candidate.wfid + 1, 'workflow')}>
                                                                        {workflows[candidate.wfid + 1]}
                                                                    </Button>
                                                                    :
                                                                    (candidate.wfid < 6) ?
                                                                        <Popconfirm title={`Bạn có muốn đổi thành ${workflows[candidate.wfid + 1]} ?`}
                                                                            placement="topLeft"
                                                                            icon={<QuestionCircleOutlined />}
                                                                            onConfirm={() => this.handleWorkflowClick(candidate.wfid + 1, 'workflow')}
                                                                        >
                                                                            <Button className='ml-3' type='primary'
                                                                                shape="round"
                                                                            >
                                                                                {workflows[candidate.wfid]}
                                                                            </Button>
                                                                        </Popconfirm>
                                                                        :
                                                                        <Button className='ml-3' type='primary'
                                                                            shape="round"
                                                                        >
                                                                            {workflows[candidate.wfid]}
                                                                        </Button>
                                                                : []
                                                        }
                                                          
                                                    </div>
                                                </Col>

                                            </Row>

                                            <Row gutter={24} className='m-1'>
                                                <strong>Status: &nbsp;&nbsp; </strong> {jobCandidateStatus[candidate.status]}
                                            </Row>
                                            {
                                                (candidate.status == 1 && (candidate.wfid > 1 && candidate.wfid < 7) && candidate.wfid != 5) && (
                                                    <Row gutter={24} className='m-1'>
                                                        <Button type='primary' onClick={() => this.getMailThank({ exam_id })} className='mr-1'>Send mail thanks</Button>
                                                    </Row>
                                                )
                                            }
                                            {
                                                candidate?.reason > 0 ?
                                                    <Row gutter={24} className='m-1'>
                                                        <strong>Reason: &nbsp;&nbsp; </strong> {typeReasonReject[candidate?.reason]}
                                                    </Row>
                                                    : []
                                            }
                                            <Row gutter={24} className='m-1'>
                                                {
                                                    candidate.status == 1 && candidate.wfid != 4 ?
                                                        <>
                                                            <Button danger onClick={() =>
                                                                this.setState({ visiblePopupReason: true })
                                                            } className='mr-1'>
                                                                Reject
                                                            </Button>
                                                            {
                                                                candidate.wfid != 3 && candidate.wfid != 5 ?
                                                                    <Button type='primary' onClick={() => this.onChangeStatusCandidate({ status: 2 }, 'apply_for_another_position')} className='mr-1'> Apply for another position </Button>
                                                                    : null
                                                            }
                                                            {
                                                                candidate?.wfid == 2 ? (
                                                                    <Button type='primary' onClick={() => this.getLinkTest(exam_id)} className='mr-1'> Tạo bài test</Button>
                                                                ) : null
                                                            }
                                                            {
                                                                candidate?.wfid == 3 || candidate?.wfid == 5 ?
                                                                    (
                                                                        <Button type='primary' onClick={() => this.setState({ visibleFormEmail: true })} className='mr-1'>{'Send mail offer'}</Button>
                                                                    ) : null

                                                            }
                                                            {
                                                                candidate?.wfid == 1 ? (
                                                                    <Button type='primary' onClick={() => this.setState({ visibleFormEmail: true })} className='mr-1'>{'Send mail interview'}</Button>
                                                                ) : null
                                                            }
                                                        </>
                                                        : []
                                                }
                                            </Row>
                                        </>
                                        : []
                                }
                            </Col>
                        </Row>
                    </div>

                    <Tabs defaultActiveKey="summary" className='card p-3' activeKey={this.state.activeKey} onChange={(activeKey) => this.setState({ activeKey })}>
                        <Tabs.TabPane tab="Summary" key="summary">
                            <Row className=''>
                                <Col span={24} className='' >
                                    <div className='mt-3 mb-2'><strong className='txt_14'>{t('PERSONAL INFORMATION')}</strong></div>

                                    <Row gutter={24} className='pl-4'>
                                        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                            <Row gutter={24}>
                                                <Col span={24}> <FontAwesomeIcon icon={faEnvelope} />&nbsp; {member.email} </Col>
                                                <Col span={24}> <FontAwesomeIcon icon={faPhone} />&nbsp; {member.phone} </Col>
                                            </Row>
                                        </Col>
                                        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                            <Row gutter={24}>
                                                <Col span={24}> <FontAwesomeIcon icon={faHome} />&nbsp; {member.address} </Col>
                                                <Col span={24}> <FontAwesomeIcon icon={faTransgender} />&nbsp;&nbsp; {(member.gender && member.gender > 0) ? genders[member.gender] : ''} </Col>
                                            </Row>
                                        </Col>
                                        <Col span={4}>
                                            <Row gutter={24}>
                                                {resume && resume.file_link ?
                                                    <a href={resume && resume.file_link} target='_blank' className='btn btn-danger'>{t('DOWNLOAD RESUME')}</a>
                                                    : []
                                                }
                                            </Row>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <div className='mt-3 mb-2'><strong className='txt_14'>{t('CAREER OBJECTIVE')}</strong></div>
                                    <div
                                        className=""
                                        dangerouslySetInnerHTML={{
                                            __html: resume && resume.summary
                                        }}
                                    >
                                    </div>
                                </Col>
                            </Row>

                            {
                                resume ?
                                    <div className=''>

                                        <Row gutter={24} className='pl-4'>
                                            <Col xs={24} sm={24} md={24} lg={3} xl={3}><strong>{t('Expected Job Title')}</strong></Col>
                                            <Col xs={24} sm={24} md={24} lg={9} xl={9}>{resume.resume_title}</Col>
                                            <Col xs={24} sm={24} md={24} lg={3} xl={3}><strong>{t('Expected Salary')}</strong></Col>
                                            <Col xs={24} sm={24} md={24} lg={9} xl={9}>
                                                {
                                                    resume ? resume.salary_unit == 'vnd' ?
                                                        `${Intl.NumberFormat('en-US').format(resume.salary_from)} - ${Intl.NumberFormat('en-US').format(resume.salary_to)} ${resume.salary_unit}`
                                                        : Object.keys(jobUnit).map(key => key == resume.salary_unit && jobUnit[key]) : ''
                                                }
                                            </Col>
                                            <Col xs={24} sm={24} md={24} lg={3} xl={3}><strong>{t('Degree')}</strong></Col>
                                            <Col xs={24} sm={24} md={24} lg={9} xl={9}>{resume.current_degree_id && resume.current_degree_id > 0 ? Object.keys(degrees).map(d => d == resume.current_degree_id && degrees[d]) : ''}</Col>
                                            <Col xs={24} sm={24} md={24} lg={3} xl={3}><strong>{t('Level')}</strong></Col>
                                            <Col xs={24} sm={24} md={24} lg={9} xl={9}>{resume.current_level_id && resume.current_level_id > 0 ? Object.keys(levels).map(l => l == resume.current_level_id && levels[l]) : ''}</Col>
                                            <Col xs={24} sm={24} md={24} lg={3} xl={3}><strong>{t('Language')}</strong></Col>
                                            <Col xs={24} sm={24} md={24} lg={9} xl={9}>{resume.languages}</Col>
                                            <Col xs={24} sm={24} md={24} lg={3} xl={3}><strong>{t('Years Of Experience')}</strong></Col>
                                            <Col xs={24} sm={24} md={24} lg={9} xl={9}>{resume.yearofexperience > 0 ? resume.yearofexperience + ' ' + t('years') : ''}</Col>
                                            <Col xs={24} sm={24} md={24} lg={3} xl={3}><strong>{t('Current Position')}</strong></Col>
                                            <Col xs={24} sm={24} md={24} lg={9} xl={9}>{resume.current_position}</Col>
                                            <Col xs={24} sm={24} md={24} lg={3} xl={3}><strong>{t('Expected Locations')}</strong></Col>
                                            <Col xs={24} sm={24} md={24} lg={9} xl={9}>{arrCity.join(',')}</Col>
                                            <Col xs={24} sm={24} md={24} lg={3} xl={3}><strong>{t('Industry')}</strong></Col>
                                            <Col xs={24} sm={24} md={24} lg={9} xl={9}>{industries.join(' , ')}</Col>
                                            <Col xs={24} sm={24} md={24} lg={3} xl={3}><strong>{t('Work locations')}</strong></Col>
                                            <Col xs={24} sm={24} md={24} lg={9} xl={9}>{this.renderWorkLocation(resume)}</Col>
                                        </Row>

                                        <div className='mt-3 mb-2'><strong className='txt_14'>{t('EXPERIENCE')}</strong></div>

                                        <Row gutter={24} className='pl-4'>
                                            <Col span={24}>
                                                <div
                                                    className=""
                                                    dangerouslySetInnerHTML={{
                                                        __html: resume.experiences
                                                    }}
                                                >
                                                </div>
                                            </Col>
                                            <Col span={24}>
                                                {this.renderExperiences(resume)}
                                            </Col>
                                        </Row>
                                        <Row>

                                        </Row>
                                        <div className='mt-3 mb-2'><strong className='txt_14'>{t('EDUCATION')}</strong></div>

                                        <Row gutter={24} className='pl-4'>
                                            <Col span={24}>
                                                <div
                                                    className=""
                                                    dangerouslySetInnerHTML={{
                                                        __html: resume.educations
                                                    }}
                                                >
                                                </div>
                                            </Col>
                                        </Row>

                                        <div className='mt-3 mb-2'><strong className='txt_14'>{t('SKILLS')}</strong></div>

                                        <Row gutter={24} className='pl-4'>
                                            <Col span={24}>
                                                <div
                                                    className=""
                                                    dangerouslySetInnerHTML={{
                                                        __html: resume.skills
                                                    }}
                                                >
                                                </div>
                                            </Col>
                                        </Row>

                                        <div className='mt-3 mb-2'><strong className='txt_14'>{t('REFERENCES')}</strong></div>

                                        <Row gutter={24} className='pl-4'>
                                            <Col span={24}>
                                                <div
                                                    className=""
                                                    dangerouslySetInnerHTML={{
                                                        __html: resume.references
                                                    }}
                                                >
                                                </div>
                                            </Col>
                                        </Row>

                                        {
                                            resume.file_link ?
                                                <Row gutter={24} className='pl-3'>
                                                    <Col span={24}>
                                                        <object data={resume.file_link} type="application/pdf" width='100%' height='900px'>
                                                            <embed src={resume.file_link} type="application/pdf" />
                                                        </object>
                                                    </Col>
                                                </Row>
                                                : []
                                        }

                                    </div>
                                    : []
                            }

                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Apply history" key="apply_history">
                            {window.innerWidth < screenResponsive ?
                                <div className='block_scroll_data_table'>
                                    <div className='main_scroll_table'>
                                        <Table
                                            className='mt-3 table_in_block'
                                            dataSource={this.state.candidates}
                                            columns={columnsHistoryApply}
                                            loading={this.state.loading}
                                            pagination={false}
                                            rowKey={r => r.id}
                                        />
                                    </div>
                                </div>
                                :
                                <Table
                                    className='mt-3 table_in_block'
                                    dataSource={this.state.candidates}
                                    columns={columnsHistoryApply}
                                    loading={this.state.loading}
                                    pagination={false}
                                    rowKey={r => r.id}

                                />
                            }
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Interview result" key="interview_result">
                            <InterviewResult candidate_id={params.job_apply_id} job_id={candidate?.job_id} />
                        </Tabs.TabPane>
                        {
                            this.state.testResult ? (
                                <Tabs.TabPane tab="Test result" key="test_result">
                                    <div>
                                        {this.renderGeneralInformation(this.state.testResult.info)}
                                    </div>
                                    {
                                        this.state.testResult.info.is_exam == 1 ?
                                            <Row className='card mt-1 p-3 pt-0'>
                                                <ListQuestion data={{
                                                    questions: this.processCandidate(),
                                                    candidate_result: this.state.testResult.candidate_result
                                                }} cbReloadData={() => { }} />
                                                <Divider className="mt-1 mb-2" />
                                            </Row> : null
                                    }
                                </Tabs.TabPane>
                            ) : null
                        }
                        <Tabs.TabPane tab="Log send mail" key="log_send_mail">
                            <Table 
                                dataSource={this.state.datasLogSendMail} 
                                pagination = {false}
                                columns={columnsLogSendMail}
                                />
                        </Tabs.TabPane>
                    </Tabs>
                    

                </Spin>

                {
                    this.state.visiblePopup ?
                        <CandidateForm
                            visible={this.state.visiblePopup}
                            hidePopup={() => this.togglePopup(false)}
                            applied={() => this.appliedCandidateForAnotherPosition()}
                            memberId={member.id}
                        />
                        : []
                }

                <Modal open={this.state.visiblePopupReason}
                    title='Reason for refusal'
                    onCancel={() => this.setState({ visiblePopupReason: false })}
                    onOk={() => this.updateCandidate(this.state.job_apply_id, { status: 0, reason: this.state.typeReason })}
                >
                    <Dropdown
                        value={this.state.typeReason}
                        datas={typeReasonReject}
                        defaultOption='-- Reason --'
                        onChange={v => this.setState({ typeReason: v })}
                    />
                </Modal>
                {
                    visibleFormEmail && (
                        <ModalForm
                            visible={visibleFormEmail}
                            onCreate={(params = {}) => this.interviewSendMail(params)}
                            onCancel={() => this.setState({ visibleFormEmail: false })}
                            testResult={testResult}
                            member={member}
                            candidate={candidate}
                        ></ModalForm>
                    )
                }
                {
                    visibleFormEmailReject && (
                        <ModalFormReject
                            visible={visibleFormEmailReject}
                            member={member}
                            onCreate={(params = {}) => this.sendMailThanks(params)}
                            onCancel={() => this.setState({ visibleFormEmailReject: false })}
                            value={objectMailReject}
                        ></ModalFormReject>
                    )
                }
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(MemberDetail));