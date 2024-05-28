import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Input, Modal } from "antd";
import Dropdown from '~/components/Base/Dropdown';
import { channels, status } from '../const';

const FormItem = Form.Item;

export class ChatBotManagementForm extends Component {
    /**
    * 
    * @param {*} props 
    */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {

        };
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
        const { visible, detail } = this.props;
        if (visible !== prevProps.visible && visible === true) {
            this.formRef.current.resetFields();
        }

        if (detail) {
            this.formRef.current.setFieldsValue({
                question: detail.question,
                answer: detail.answer,
                channel: detail.channel,
                status: detail.status,
            });
        }
    }

    /**
     * @render
     */
    render() {
        const { visible, onCancel, onCreate, onUpdate, detail } = this.props;
        const {t} = this.props.translang
        return (
            <Modal
                open={visible}
                title={detail ? (t("edit") + t(' ') + t("hr:collection")) : t('hr:create_new_collection')}
                okText="Save"
                onCancel={onCancel}
                onOk={() => {
                    //check validate
                    this.formRef.current.validateFields()
                        .then(values => {
                            let params = {
                                ...values,
                                channel: Number(values.channel),
                                status: Number(values.status),
                                is_sent: false,
                            }

                            if (detail) {
                                params = {
                                    ...params,
                                    id: detail.id
                                }
                                onUpdate(params);
                            } else {
                                onCreate(params);
                            }
                        })
                        .catch(errorInfo => {
                            console.log(errorInfo);
                        });
                }}
            >
                <Form layout="vertical" ref={this.formRef} >
                    <FormItem
                        name="question"
                        label={t("question")}
                        rules={[{ required: true, message:t('hr:please_input') + t('') +t('hr:title_of_collection') }]}
                    >
                        <Input />
                    </FormItem>
                    <FormItem name="answer" label={t("answer")} rules={[{ required: true, message:t('hr:please_input') + t('') +t('hr:answer_of_collection')}]}>
                        <Input type="textarea" />
                    </FormItem>
                    <FormItem name="status" label={t("status")} rules={[{ required: true, message:t('hr:please_input') + t('') +t('hr:status_of_collection')}]}>
                        <Dropdown
                            datas={status}
                            placeholder={t('hr:please_select') + t('') +  t("hr:status")}
                        />
                    </FormItem>
                    <FormItem name="channel" label={t("hr:channel")} rules={[{ required: true, message:t('hr:please_input') + t('') +t('hr:channel_of_collection') }]}>
                        <Dropdown
                            datas={channels}
                            placeholder={t('hr:please_select') + t('') + t("hr:channel")}
                        />
                    </FormItem>
                </Form>
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
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ChatBotManagementForm)