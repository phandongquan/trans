import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Row, Col, Input, Form, Divider, Space } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import Dropdown from '~/components/Base/Dropdown';

class Specialized extends Component {
    render() {
        let { t, baseData: { cities } } = this.props;

        return (
            <Form.List name="specializeds">
                {
                    (fields, { add, remove }) => {
                        return (
                            <>
                                <PageHeader
                                    title={t('Specialized')}
                                    className="p-0"
                                    tags={[<Button key="create-specialized" type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => add()} />]}
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
export default connect(mapStateToProps)(withTranslation()(Specialized));