import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Col, Input, Form, Modal, Spin, Popconfirm } from "antd";
import { pushNotification } from '~/apis/company/document';
import { showNotify } from '~/services/helper';
import { typePushNotificationExam } from '~/constants/basic';

class FormSendNotification extends Component {

    constructor(props) {
        super(props);
        this.formSendNotifiRef = React.createRef();
        this.state = {
            loading: false
        };
    }

    /**
     * Check validate from after click submit 
     */
    handleFormSubmit = () => {
        this.formSendNotifiRef.current.validateFields()
        .then((values) => {
            this.submitModal(values);
        })
        .catch((info) => {
            console.log('Validate Failed:', info);
        });
    }

    /**
     * Submit form
     */
    submitModal = () => {
        let { t, examId, examType, listStaffExam, staffSelectedRowKeys } = this.props;

        let staff_ids = [];
        if(Array.isArray(listStaffExam) && Array.isArray(staffSelectedRowKeys)) {
            staffSelectedRowKeys.map(id => {
                let row = listStaffExam.find(se =>  se.id == id);
                if(!staff_ids.includes(row?.staff_id)) {
                    staff_ids.push(row?.staff_id);
                }
            });
        }

        if(staff_ids.length == 0) {
            showNotify(t('Notification'), t('Không có danh sách nhân viên!'), 'warning');
            return false;
        }

        let values = this.formSendNotifiRef.current.getFieldsValue();
        values.content = values.content.replace(/\r?\n/g, '\n');
        values = {
            ...values,
            data: { notify: { exam_id: Number(examId), type: typePushNotificationExam, exam_type: examType } },
            staff_ids
        }

        this.setState({ loading: true })
        let xhr = pushNotification(values);
        xhr.then((response) => {
            this.setState({ loading: false })
            if (response.status !== 0) {
                showNotify(t('Notification'), t('Thông báo đã được gửi đến các nhân viên trong danh sách!'), 'success', 1, () => {
                    this.props.toggleModal(false);
                    this.formSendNotifiRef.current.resetFields();
                });
            } else {
                showNotify(t('Notification'), response.message, 'error');
            }
        });
    }

    render() {
        let { t } = this.props;

        return (
            <Modal
                forceRender
                title={t('Send Notification')}
                open={this.props.visible}
                onCancel={() => this.props.toggleModal(false)}
                onOk={this.handleFormSubmit.bind(this)}
                width='40%'
                okText={t('Push Notify')}
                cancelText='Cancel'
            >
                <Spin spinning={this.state.loading}>
                    <Form
                        preserve={false}
                        ref={this.formSendNotifiRef}
                        layout="vertical"
                    >
                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item name='title' label='Title' hasFeedback
                                    rules={[{ required: true, message: t('Please input title') }]}>
                                    <Input placeholder={t('Title')} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name='content' label='Content' hasFeedback
                                    rules={[{ required: true, message: t('Please input content') }]}>
                                    <Input.TextArea placeholder='Content' rows={3}/>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Spin>
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
        auth: state.auth.info,
        baseData: state.baseData
    }
}

export default connect(mapStateToProps)(withTranslation()(FormSendNotification));