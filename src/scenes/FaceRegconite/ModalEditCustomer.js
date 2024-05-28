import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux'
import { Button, Row, Col, Form, Input, Modal, Select, Checkbox } from "antd";
import Dropdown from '~/components/Base/Dropdown';
import { typeCustomer } from '~/constants/basic';
import debounce from 'lodash/debounce';
import axios from 'axios';
import { showNotify } from '~/services/helper';
import { getCustomerSearch, putCustomerUpdateByLogId } from '~/apis/aiFaceLog';

export class ModalEditCustomer extends Component {
    constructor(props) {
        super(props)
        this.formEditRef = React.createRef()
        this.state = {
            loading: false,
            datasCustomer: [],
            valueCustomer: {},
        }
        this.getListCustomer = debounce(this.getListCustomer, 400);
    }
    componentDidMount() {
        const data = this.props.data;
        if (Object.keys(data)?.length != 0) {
            this.formEditRef.current.setFieldsValue(data)
        }
    }
    async getListCustomer(params = {}) {
        let response = await getCustomerSearch(params);
        if (response) {
            this.setState({ datasCustomer: response })
        }
    }
    renderOptionsName() {
        const { Option } = Select;
        let datas = this.state.datasCustomer.length ? this.state.datasCustomer : [];
        let listOptions = [];
        if (Array.isArray(datas) && datas.length) {
            datas.map((data, index) =>
                listOptions.push(
                    <Option key={index} value={data.id}>
                        <span>{data.name}</span>
                    </Option>
                )
            );
        }
        return listOptions;
    }
    /**
     * @event search dropdon
     * @param {*} q 
     */
    onSearch(q) {
        this.getListCustomer({ name: q })
    }
    /**
     * @event before submit form
     * Validate before submit
     */
    handleSubmitEdit() {
        this.formEditRef.current.validateFields()
            .then((values) => {
                values.applyAll = values.applyAll ? true : false
                this.submitFormEdit(values)
            }
            )
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }
    submitFormEdit(values) {
        this.setState({ loading: true })
        let xhr = putCustomerUpdateByLogId({
            id: values.id,
            isCustomer: values.is_customer,
            applyAll: values.applyAll,
            customer_id: Number(values?.customer_id),
            customer_name: values?.customer_name,
        })
        xhr.then(res => {
            this.props.onSubmitSuccess()
            this.setState({ loading: false }, () => showNotify('Notification', 'success'))
        })
        xhr.catch(err => console.log(err))
    }
    render() {
        let { t, visible } = this.props;

        return (
            <Modal
                title={t('edit')}
                open={visible}
                onCancel={() => this.props.onCancel()}
                onOk={() => this.handleSubmitEdit()}
                afterClose={() => {
                    this.formEditRef.current.resetFields();
                }}
                confirmLoading={this.state.loading}
                forceRender
            >
                <Form
                    ref={this.formEditRef}
                    name="editForm"
                    // onFinish={this.submitFormEdit.bind(this)}
                    layout="vertical" autoComplete="off"
                >
                    <Row>
                        <span>ID</span>
                        <Col className='mt-2' span={24}>
                            <Form.Item name='id'>
                                <Input disabled />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <span>{t('staff')}</span>
                            <Form.Item name={'staff'}>
                                <Select
                                    onClick={this.onMouseEnter}
                                    showSearch={true}
                                    optionFilterProp="children"
                                    filterOption={false}
                                    placeholder={t('name')}
                                    value={this.state.valueCustomer}
                                    allowClear={true}
                                    onSelect={(value) => {
                                        this.setState({ valueCustomer: value })
                                        let staff = this.state.datasCustomer.filter(d => d.id == value)
                                        this.formEditRef.current.setFieldsValue({ customer_id: staff[0]?.id, customer_name: staff[0]?.name })
                                    }}
                                    onChange={(value) => this.setState({ valueCustomer: value })}
                                    onClear={(value) => this.setState({ valueCustomer: value })}
                                    onSearch={(value) => this.onSearch(value)}
                                >
                                    {this.renderOptionsName()}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <span>{t('hr:customer_id')}</span>
                        <Col className='mt-2' span={24}>
                            <Form.Item name='customer_id' hasFeedback rules={[
                                {
                                    required: true,
                                    message: t('hr:input_id_number')
                                },
                                {
                                    pattern: new RegExp(/^[0-9]{1,}$/),
                                    message: t('hr:invalid_id_number')
                                }
                            ]}>
                                <Input placeholder={t('hr:customer_id')} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <span>{t('name')}</span>
                        <Col className='mt-2' span={24}  >
                            <Form.Item name={'customer_name'} hasFeedback rules={[
                                {
                                    required: true,
                                    message: t('hr:input_id_number')
                                }]}>
                                <Input placeholder='Name' />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={16}>
                            <span>{t('hr:is_customer')}</span>
                            <Col className='mt-2' span={22} >
                                <Form.Item name={'is_customer'} hasFeedback rules={[
                                    {
                                        required: true,
                                        message: t('hr:input_user_type')
                                    }]}>
                                    <Dropdown datas={typeCustomer} />
                                </Form.Item>
                            </Col>
                        </Col>
                        <Col span={8} >
                            <span>{t('hr:apply_all')}</span>
                            <Col className='mt-2' span={24}  >
                                <Form.Item valuePropName="checked" name={'applyAll'}>
                                    <Checkbox />
                                </Form.Item>
                            </Col>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ModalEditCustomer))