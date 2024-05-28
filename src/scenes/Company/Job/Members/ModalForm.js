import React, { Component } from "react";
import { Form, Input, Button, Modal, DatePicker, Tooltip, Space, message, Upload } from "antd";
import Editor from '~/components/Base/Editor';
import dayjs from 'dayjs';
import './config/ModalForm.css';
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { UserAddOutlined } from '@ant-design/icons';
import { EMAIL_TUYENDUNG_HSK } from "~/constants/basic";
import { interviewSendMail, interviewSendMailOffer } from "~/apis/company/job/candidate";
import StaffDropdown from '~/components/Base/StaffDropdown';
import Dropdown from "~/components/Base/Dropdown";
import { searchForDropdown } from "~/apis/company/staffSearchDropDown";
import { UploadOutlined } from '@ant-design/icons';
import { showNotify } from "~/services/helper";

class ModalForm extends Component {

    /**
     *
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            membersCC: [EMAIL_TUYENDUNG_HSK],
            visibleAddMemberCC: false,
            textMailCC: '',
            note: '',
            title: '',
            noteReview: '',
            temp: {
                "interview_date": null,
                "interview_address": null,
                "interviewer_name": null
            },
            selectAttachments: []
        }
    }

    componentDidMount() {
        const exam_id = this.props.testResult?.info?.exam_id;
        const wfid = this.props.candidate?.wfid;
        this.getInterviewSendMail(exam_id, wfid)
    }

    getInterviewSendMail = async (exam_id, wfid) => {
        let xhr;
        if (wfid == 5 || wfid == 3) {
            xhr = interviewSendMailOffer(exam_id)
        } else {
            xhr = interviewSendMail(exam_id)
        }

        xhr.then(async res => {
            const { data } = res;
            const { rows = {} } = data;
            let { content = "", title = "", interviewer_id, interview_date, interview_address, interview_address_id } = rows;
            this.setState({ noteReview: content })

            if (content !== "") {
                if (interview_address !== "") {
                    content = content.replace(/\[interview_address\]/g, interview_address);
                    this.setState({ temp: { ...this.state.temp, interview_address: interview_address } });
                }

                if (interviewer_id) {
                    const response = await searchForDropdown({ ids: interviewer_id, limit: 1, sort: "staff_id", get_inactive: 1 })
                    const { data } = response;
                    const staff = data[0]
                    const interviewInfo = `${staff.staff_name} (${staff.staff_dept}/${staff.staff_major})`
                    content = content.replace(/\[interviewer_name\]/g, interviewInfo);
                    this.setState({ temp: { ...this.state.temp, interviewer_name: interviewInfo } });
                }

                if (interview_date) {
                    content = content.replace(/\[interview_date\]/g, dayjs(interview_date).format('YYYY-MM-DD HH:mm:ss'));
                    this.setState({ temp: { ...this.state.temp, interview_date: interview_date } });
                }
            }
            this.setState({ note: content, title: title })
            this.formRef.current.setFieldsValue({
                email: this.props.member.email,
                interviewer_id: interviewer_id,
                date: interview_date ? dayjs(interview_date) : null,
                location: interview_address_id,
            })
        })
    }

    renderMemberCC = () => {
        const { membersCC } = this.state;

        return membersCC.join(', ');
    }

    onSetNote = (str) => this.setState({ note: str });

    submitForm = (values) => {
        const { onCreate } = this.props;
        const { note, selectAttachments } = this.state;
        const wfid = this.props.candidate?.wfid;
        const params = {
            ...values,
            note,
            mail_title: this.state.title,
        }

        if (wfid == 5 || wfid == 3) {
            params.attachments = selectAttachments;
        }

        if (onCreate) {
            onCreate(params);
        }
    }

    onChangeAddress = (e) => {
        setTimeout(() => {
            const addressEl = document.getElementsByClassName('ant-select-selection-item')[0]
            if (addressEl) {
                const address = addressEl.innerText
                let { noteReview } = this.state;
                let wfid = this.props.candidate?.wfid;
                let { temp } = this.state;
                let { interviewer_name, interview_date } = temp;

                if (wfid == 5 || wfid == 3) {
                    noteReview = noteReview.replace(/\[address\]/g, address);

                    if (interview_date) {
                        noteReview = noteReview.replace('[hh]/ [dd/mm/yyyy]', dayjs(interview_date).format('HH:mm:ss DD/MM/YYYY'));
                    }
                } else {
                    noteReview = noteReview.replace(/\[interview_address\]/g, address);

                    if (interviewer_name) {
                        noteReview = noteReview.replace(/\[interviewer_name\]/g, interviewer_name);
                    }

                    if (interview_date) {
                        noteReview = noteReview.replace(/\[interview_date\]/g, dayjs(interview_date).format('YYYY-MM-DD HH:mm:ss'));
                    }
                }
                this.setState({ note: noteReview, temp: { ...temp, interview_address: address } });
            }
        }, 0)
    }

    onChangeDate = (date, dateString) => {
        let { noteReview, temp } = this.state;
        let wfid = this.props.candidate?.wfid;
        let { interviewer_name, interview_address } = temp;

        if (wfid == 5 || wfid == 3) {
            noteReview = noteReview.replace('[hh]/ [dd/mm/yyyy]', dayjs(dateString).format('YYYY-MM-DD HH:mm:ss'));

            if (interview_address) {
                noteReview = noteReview.replace(/\[address\]/g, interview_address);
            }
        } else {
            noteReview = noteReview.replace(/\[interview_date\]/g, dayjs(dateString).format('YYYY-MM-DD HH:mm:ss'));

            if (interviewer_name) {
                noteReview = noteReview.replace(/\[interviewer_name\]/g, interviewer_name);
            }

            if (interview_address) {
                noteReview = noteReview.replace(/\[interview_address\]/g, interview_address);
            }
        }

        this.setState({ note: noteReview, temp: { ...temp, interview_date: date } });
    }

    render() {
        const { visible, onCancel, t, member, baseData: { locations } } = this.props;
        const { visibleAddMemberCC, textMailCC, temp } = this.state;
        const {
            interview_address,
            interview_date,
        } = temp;
        const height = window.innerHeight - 200;
        const locationsFormatName = []
        locations.map(loc => locationsFormatName.push({
            id: loc.id,
            name: loc.address
        }))
        const wfid = this.props.candidate?.wfid;
        return (
            <Modal
                visible={visible}
                okText="Submit"
                cancelText="Cancel"
                wrapClassName="modal-form-candidate"
                width={'50%'}
                onCancel={onCancel}
                style={{ top: 20, height: height }}
                onOk={() => {
                    this.formRef.current
                        .validateFields()
                        .then((values) => {
                            this.submitForm(values);
                        })
                        .catch((info) => {
                            console.log('Validate Failed:', info);
                        });
                }}
            >
                <Form
                    ref={this.formRef}
                    name="upsertStaffForm"
                    className="ant-advanced-search-form pt-3"
                    layout="vertical"
                    onFinish={this.submitForm.bind(this)}
                >
                    <Form.Item>
                        <h2><strong>Title: </strong>{member.resume_title}</h2>
                    </Form.Item>
                    <Form.Item>
                        <p><strong>Tên ứng viên: </strong>{member.fullname}</p>
                    </Form.Item>
                    <Form.Item name='email' label={<strong>Email :</strong>}>
                        {/* <p><strong>Email: </strong>{member.email}</p> */}
                        <Input placeholder="Email" />
                    </Form.Item>
                    <Form.Item>
                        <Space size={5}>
                            <p>
                                <strong>Mail cc: </strong>
                                {this.renderMemberCC()}{" "}
                                <Tooltip title="Add member cc">
                                    <UserAddOutlined onClick={() => this.setState({ visibleAddMemberCC: !visibleAddMemberCC })} />
                                </Tooltip>
                            </p>
                            {
                                visibleAddMemberCC ? (
                                    <Input
                                        value={textMailCC}
                                        style={{ width: '100%' }}
                                        placeholder="Email"
                                        onChange={(e) => this.setState({ textMailCC: e.target.value })}
                                        onPressEnter={(e) => this.setState({
                                            membersCC: [...this.state.membersCC, e.target.value],
                                            textMailCC: ''
                                        })}
                                    />
                                ) : null
                            }
                        </Space>
                    </Form.Item>
                    <Form.Item name={"date"} label="Thời gian" rules={[{ required: true, message: t('Please input date') }]}>
                        <DatePicker
                            format="YYYY-MM-DD HH:mm:ss"
                            showTime={{
                                defaultValue: dayjs('00:00:00', 'HH:mm:ss'),
                            }}
                            onChange={(date, dateString) => this.onChangeDate(date, dateString)}
                        />
                    </Form.Item>
                    <Form.Item name={"location"} label="Địa điểm" rules={[{ required: true, message: t('Please input location') }]}>
                        <Dropdown
                            datas={locationsFormatName}
                            defaultOption='-- All Locations --'
                            onSelect={(e) => this.onChangeAddress(e)}
                        />
                    </Form.Item>
                    {
                        wfid == 1  ? (
                            <Form.Item name={'interviewer_id'} label='Interviewer' rules={[{ required: true, message: t('Please input interviewer') }]}>
                                <StaffDropdown
                                    defaultOption={'-- All staffs --'}
                                    onSelect={(e) => {
                                        setTimeout(() => {
                                            let interviewer = document.getElementsByClassName('ant-select-selection-item')[1]
                                            if (interviewer) {
                                                const staff = interviewer.innerText.split(' - ')[1]
                                                let { noteReview } = this.state;
                                                noteReview = noteReview.replace(/\[interviewer_name\]/g, staff);

                                                if (interview_address) {
                                                    noteReview = noteReview.replace(/\[interview_address\]/g, interview_address);
                                                }

                                                if (interview_date) {
                                                    noteReview = noteReview.replace(/\[interview_date\]/g, dayjs(interview_date).format('YYYY-MM-DD HH:mm:ss'));
                                                }

                                                this.setState({ note: noteReview, temp: { ...temp, interviewer_name: staff } });
                                            }
                                        }, 0)

                                    }}
                                />
                            </Form.Item>
                        ) : null
                    }
                    <Form.Item label="Tiêu đề mail">
                        <Input
                            value={this.state.title}
                            onChange={(e) => this.setState({ title: e.target.value })}
                        />
                    </Form.Item>
                    {
                        wfid == 5 || wfid == 3  ? (
                            <Form.Item
                                label={t('hr:attachment')}
                            >
                                <Upload
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                    maxCount={3}
                                    onChange={({ fileList }) => { }}
                                    onDrop={(e) => { }}
                                    onRemove={(file) => {
                                        const { selectAttachments } = this.state;
                                        const newFiles = selectAttachments.filter(f => f.uid !== file.uid);
                                        this.setState({ selectAttachments: newFiles })
                                    }}
                                    beforeUpload={(file) => {
                                        const { selectAttachments } = this.state;
                                        if (selectAttachments.length > 3) {
                                            showNotify('Thông báo', 'Bạn chỉ được chọn tối đa 3 file', 'error')
                                            return false;
                                        }
                                        const newFiles = [...selectAttachments, file];
                                        this.setState({ selectAttachments: newFiles });
                                        return false;
                                    }}
                                >
                                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                                </Upload>
                            </Form.Item>) : null
                    }
                    <Form.Item
                        label={t('note')}
                        hasFeedback
                        rules={[{ required: true, message: t('Please input note') }]}>
                        <Editor
                            style={{ height: 300 }}
                            value={this.state.note}
                            placeholder={t('Please input note')}
                            onChange={(value) => this.setState({ note: value })}
                        />
                    </Form.Item>
                </Form>
            </Modal >
        )
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
export default connect(mapStateToProps)(withTranslation()(ModalForm));