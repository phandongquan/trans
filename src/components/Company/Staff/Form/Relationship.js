import React, { Component } from 'react';
import { Button, Col, Input, Form, Divider, Space } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { withTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';


class Relationship extends Component {
    render() {
        let { t } = this.props;
        return (
            <Form.List name="relationships">
                {
                    (fields, { add, remove }) => {
                        return (
                            <>
                                <PageHeader
                                    title={t('Relationships')}
                                    className="p-0"
                                    tags={[<Button key="create-relationships" type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => add()} />]}
                                />
                                <Divider className="m-0 mb-2" />
                                <Col span={24}>
                                    {fields.map(field => {
                                        return (
                                            <Space key={field.key} style={{ display: 'flex', marginBottom: 1 }} align="baseline">
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
                                                    name={[field.name, 'relationship']}
                                                    fieldKey={[field.fieldKey, 'relationship']}
                                                    rules={[{ required: true, message: 'Missing relationship' }]}
                                                >
                                                    <Input placeholder="Relationship" />
                                                </Form.Item>
                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, 'phone']}
                                                    fieldKey={[field.fieldKey, 'phone']}
                                                    rules={[{ required: true, message: 'Missing phone' }]}
                                                >
                                                    <Input placeholder="Phone Number" />
                                                </Form.Item>
                                                <Button type="primary" danger onClick={() => remove(field.name)} icon={<FontAwesomeIcon icon={faMinus} />} />
                                            </Space>
                                        )
                                    })}
                                </Col>
                            </>
                        )
                    }
                }
            </Form.List>
        );
    }
}

export default withTranslation()(Relationship);