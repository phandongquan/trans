import React, { Component } from "react";
import { Form, Input, Modal, Space, Tooltip, } from "antd";
import Editor from '~/components/Base/Editor';
import './config/ModalForm.css';
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { EMAIL_TUYENDUNG_HSK } from "~/constants/basic";
import { UserAddOutlined } from '@ant-design/icons';

class ModalFormReject extends Component {

    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            membersCC: [EMAIL_TUYENDUNG_HSK],
            visibleAddMemberCC: false,
            textMailCC: '',
            note: '',
            title: '',
            content: '',
        }
    }

    componentDidMount() {
        const { value } = this.props;
        const { title, content, } = value;
        this.setState({ title, content })
    }

    renderMemberCC = () => {
        const { membersCC } = this.state;

        return membersCC.join(', ');
    }

    onSetNote = (str) => this.setState({ note: str });

    submitForm = (values) => {
        const { onCreate } = this.props;
        const { content, title } = this.state;
        const params = {
            ...values,
            note: content,
            mail_title: title,
        }

        if (onCreate) {
            onCreate(params);
        }
    }


    render() {
        const { visible, onCancel, t, value, member } = this.props;
        const { title } = value;
        const { visibleAddMemberCC, textMailCC } = this.state;
        return (
            <Modal
                visible={visible}
                okText="Submit"
                cancelText="Cancel"
                wrapClassName="modal-form-candidate"
                width={'50%'}
                onCancel={onCancel}
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
                        <h2><strong>Title: </strong>{title}</h2>
                    </Form.Item>
                    <Form.Item>
                        <p><strong>Tên ứng viên: </strong>{member.fullname}</p>
                    </Form.Item>
                    <Form.Item>
                        <p><strong>Email: </strong>{member.email}</p>
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
                    <Form.Item label="Tiêu đề mail">
                        <Input
                            value={this.state.title}
                            style={{ width: '100%' }}
                            placeholder="Tiêu đề mail"
                            onChange={(e) => this.setState({ title: e.target.value })}
                        />
                    </Form.Item>
                    <Form.Item
                        label={t('content')}
                        hasFeedback
                        rules={[{ required: true, message: t('Please input content') }]}>
                        <Editor
                            style={{ height: 300 }}
                            value={this.state.content}
                            placeholder={t('Please input content')}
                            onChange={(value) => this.setState({ content: value })}
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
export default connect(mapStateToProps)(withTranslation()(ModalFormReject));