import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Modal, Form, Input } from 'antd';
import { update as apiUpdate, create as apiCreate } from '~/apis/company/jobQuestion';
import { showNotify, convertToFormData } from '~/services/helper';

class JobQuestionForm extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            loading: false
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data != this.props.data) {
            this.formRef.current.setFieldsValue(this.props.data)
        } else if (this.props.data) {
            this.formRef.current.resetFields();
        }
    }

    submitForm = () => {
        let values = this.formRef.current.getFieldsValue();
        if (!values.priority || values.priority < 0) {
            values.priority = 0;
        }

        let xhr;
        let { t, data } = this.props;
        if (data?.id) {
            values = {
                ...values,
            }
            xhr = apiUpdate(data?.id, convertToFormData(values));
        } else {
            xhr = apiCreate(convertToFormData(values));
        }

        xhr.then(response => {
            this.setState({ loading: false })
            if (response.status) {
                showNotify(t('hr:notification'), data?.id ? t('hr:update_susscess') : t('Create success'), 'success');
                this.props.hiddenPopup();
                this.props.getList();
            }
        })
    }

    render() {
        let { t } = this.props;
        return (
            <Modal
                loading={this.state.loading}
                forceRender
                title={t('hr:job_question')}
                open={this.props.visible}
                onCancel={() => this.props.hiddenPopup()}
                okText={t('Submit')}
                width='60%'
                afterClose={() => this.formRef.current.resetFields()}
                onOk={() => this.formRef.current.submit()}
            >
                <Form
                    ref={this.formRef}
                    layout='vertical'
                    onFinish={this.submitForm}
                >
                    <Form.Item name='title' label={t('hr:title')} hasFeedback
                        rules={[{ required: true, message: t('hr:input_title') }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name='answer' label={t('hr:answer')} hasFeedback
                        rules={[{ required: true, message: t('hr:input_answer') }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name='priority' label={t('hr:priority')} hasFeedback
                        rules={[{ required: true, message: t('hr:input_priority') }]}
                    >
                        <Input type='number' />
                    </Form.Item>
                </Form>
            </Modal>
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
export default connect(mapStateToProps)(withTranslation()(JobQuestionForm));