import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Col, Input, Form, Divider, DatePicker, Space } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { withTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import Dropdown from '~/components/Base/Dropdown';

class PractisingCetificate extends Component {
    render() {
        let { t, baseData: { cities } } = this.props;
        return (
            <Form.List name="practising_certificates">
                {
                    (fields, { add, remove }) => {
                        return (
                            <>
                                <PageHeader
                                    title={t('Practising Cetificate')}
                                    className="p-0"
                                    tags={[<Button key="create-practising-certificate" type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => add()} />]}
                                />
                                <Divider className="m-0 mb-2" />
                                <Col span={24}>
                                    {fields.map(field => (
                                        <Space key={field.key} style={{ display: 'flex', marginBottom: 1 }} align="baseline">
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'code']}
                                                fieldKey={[field.fieldKey, 'code']}
                                                rules={[{ required: true, message: 'Missing Code' }]}
                                            >
                                                <Input placeholder="Code" />
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'name']}
                                                fieldKey={[field.fieldKey, 'name']}
                                                rules={[{ required: true, message: 'Missing name' }]}
                                            >
                                                <Input placeholder="Name" />
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'specialized']}
                                                fieldKey={[field.fieldKey, 'specialized']}
                                                rules={[{ required: true, message: 'Missing Specialized' }]}
                                            >
                                                <Input placeholder="Specialized" />
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'place']}
                                                fieldKey={[field.fieldKey, 'place']}
                                                rules={[{ required: true, message: 'Missing Place' }]}
                                            >
                                                <Dropdown datas={cities} placeholder="-- All Place --" />
                                            </Form.Item>
                                            <Form.Item
                                                {...field}
                                                name={[field.name, 'expire_date']}
                                                fieldKey={[field.fieldKey, 'expire_date']}
                                                rules={[{ required: true, message: 'Missing Expire Date' }]}
                                            >
                                                <DatePicker placeholder="Expire Date" />
                                            </Form.Item>
                                            <Button type="primary" danger onClick={() => remove(field.name)} icon={<FontAwesomeIcon icon={faMinus} />} />
                                            {/* <MinusCircleOutlined onClick={() => remove(field.name)} /> */}
                                        </Space>
                                    ))}
                                </Col>
                            </>
                        )
                    }
                }
            </Form.List>
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
export default connect(mapStateToProps)(withTranslation()(PractisingCetificate));