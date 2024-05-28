import React, { Component } from 'react';
import { Modal, Input, Form, Col, Row } from 'antd';
import { sendNotify } from '~/apis/company/document/index';
import { showNotify } from '~/services/helper';
import DocumentOptions from './DocumentOptions';
class DocumentSendNotifyModal extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.visible !== this.props.visible) {
            this.formRef.current.setFieldsValue({ 
                title: 'Tài liệu mới cập nhật: "<<document_name>>"',
                content :'Tài liệu "<<document_name>>" vừa được cập nhật',
            });
        }
    }

    /**
     * Handle submit form
     * @param {*} e 
     */
    handleSubmit = (e) => {
        let values = this.formRef.current.getFieldsValue();
        let data = { 
            document_id: this.props.documentId,
            title: values.title,
            content: values.content
        };
        let xhr = sendNotify(data);
        xhr.then((response) => {
            if (response.status !== 0) {
                showNotify('Notification', 'Notification sent successfully');
                this.formRef.current.resetFields();
                this.props.hiddenModal()
            } else {
                showNotify('Notification', response.message, 'error');
            }
        });
    }

    render() {
        let { visible } = this.props;
        return (
            <Modal title="SendNotidyDocument" open={visible}
                onCancel={() => this.props.hiddenModal()}
                onOk={() => this.handleSubmit()}
            >
                <Form
                    layout='vertical'
                    ref={this.formRef}
                >
                    <Row gutter={12}>
                        <Col span={24}>
                            <Form.Item  name='title' label='Title'>
                                <Input placeholder='Title' />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name='content' label='Content'>
                                <Input.TextArea  />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <p style={{ color: "#ff4d4f", fontSize: 12 }}>
                                {`<<document_name>>`}: Tên của document mặc định được lấy ra.
                            </p>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        )
    }
}

export default (DocumentSendNotifyModal)
