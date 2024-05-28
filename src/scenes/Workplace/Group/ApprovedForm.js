import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Modal, Form, Row, Col, Input } from 'antd';
import Avatar from '~/components/Base/Avatar';
import Dropdown from '~/components/Base/Dropdown';
import { update as apiUpdate } from '~/apis/workplace/group';
import { convertToFormData, showMessage } from '~/services/helper';

// const WORKPLACE_MEDIA_URL = 'https://work.hasaki.vn/workplace/';
const WORKPLACE_MEDIA_URL = 'http://ws.hasaki.local/production/workplace/';
export class ApprovedForm extends Component {

    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            file: {},
        }
    }

    componentDidUpdate(prevState, prevProps) {
        if(this.props.group != prevProps.group) {
            this.formRef.current.setFieldsValue(this.props.group);
        }
    }

    /**
     * @event before submit form
     * Validate before submit
     */
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
     * Submit form
     */
    submitForm = () => {
        let { t, group } = this.props;
        let values = this.formRef.current.getFieldsValue();
        let formData = convertToFormData(values);
        if(Object.keys(this.state.file).length) {
            formData.append('image', this.state.file)
        }

        formData.append('_method', 'PUT');
        formData.append('is_admin', 1);
        let xhr = apiUpdate(group.id, formData);
        let message = (t('update') + (' ') + t('group'));
        
        xhr.then(response => {
            if(response.status) {
                showMessage(message)
                this.formRef.current.resetFields();
                this.props.togglePopup();
                this.props.refreshTable();
            }
        })
    }

    render() {
        const { t, visible, group } = this.props;
        return (
            <Modal
                title={t('update') + (' ') + t('group')}
                open={visible}
                forceRender
                onCancel={() => this.props.togglePopup()}
                onOk={this.handleFormSubmit.bind(this)}
                width='60%'
            >
                <Form
                    preserve={false}
                    ref={this.formRef}
                    layout='vertical'
                >
                    <Row gutter={24}>
                        <Col span={24}>
                            <Form.Item label={t('Name')} name='name' hasFeedback rules={[{ required: true, message: t('hr:input_name') }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={t('description')} name='description'>
                                <Input.TextArea />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={t('avatar')}
                                extra='Image support PNG/JPG/JPEG. Size max 2MB!'
                            >
                                <Avatar
                                    onChange={(e) => this.setState({ file: e })}
                                    url={WORKPLACE_MEDIA_URL + group?.avatar?.url}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name='type' label={t('privacy')} hasFeedback rules={[{ required: true, message: t('hr:please_select') + (' ') + t('hr:privacy') }]}>
                                <Dropdown datas={{0: t('public'), 1: t('private')}} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        )
    }
}

const mapStateToProps = (state) => ({
    
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ApprovedForm))
