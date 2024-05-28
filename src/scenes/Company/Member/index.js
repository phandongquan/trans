import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Input, Popconfirm, Form, Modal } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faPen, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { getByStaff as getRelationByStaff, create, update, destroy } from '~/apis/company/job/member';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Dropdown from '~/components/Base/Dropdown';
import Tab from '~/components/Base/Tab';
import tabConfig from './config/tab';
import { showNotify } from '~/services/helper';

const FormItem = Form.Item;
class Member extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            visible: false,
            relationships: []
        };
        this.formRef = React.createRef();
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getData();
    }

    /**
     * Get list relationship for staff
     * @param {} params 
     */
    async getData(params = {}) {
        this.setState({ loading: true });
        let { match } = this.props;
        let { id } = match.params;
        /**
         * @fetch API
         */
        let relationshipXhr = await getRelationByStaff(id);
        let relationships = (relationshipXhr.status == 1) ? relationshipXhr.data.rows : {};

        this.setState({ relationships }, () => this.setState({ loading: false }));
    }

    /**
     * @event toggle modal
     * @param {*} visible 
     */
    toggleModal(visible) {
        this.setState({ visible });
    }

    /**
     * @event delete relationship
     * @param {*} e 
     * @param {*} id 
     */
    async onDeleteRelationship(e, id) {
        this.setState({ loading: true });
        let xhr = await destroy(id);
        let result = (xhr.status == 1) ? xhr.data : {};
        if (result) {
            let relationships = [...this.state.relationships];
            let index = relationships.indexOf(relationships.find(r => r.id == id));

            /**
             * Update new list
             */
            relationships.splice(index, 1);
            this.setState({ relationships });

            let { t } = this.props;
            showNotify(t('Notification'), t('Data has been deleted!'));
        }
        this.setState({ loading: false });
    }

    /**
     * @event before show modal edit relationship
     * @param {*} id 
     */
    onEditRelationship(id = null) {
        this.toggleModal(true);
        if (!id) {
            this.formRef.current.resetFields();
        } else {
            let { relationships } = this.state;
            let data = relationships.find(r => r.id == id);
            this.formRef.current.setFieldsValue(data);
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
     * @event submit form
     * @param {Object} values 
     */
    async submitForm(values) {
        let xhr;
        this.setState({ loading: true });
        let { t, match } = this.props;
        let staff_id = match.params.id;
        let submitData = {
            ...values,
            staff_id
        }
        if (values.id) {
            xhr = await update(values.id, submitData);
        } else {
            xhr = await create(submitData);
        }

        let relationship = (xhr.status == 1) ? xhr.data.staff_relationship : {};
        let relationships = [...this.state.relationships];

        /**
         * Update new list
         */
        if (!values.id) {
            relationships.push(relationship);
        } else {
            let index = relationships.indexOf(relationships.find(r => r.id == relationship.id));
            relationships[index] = relationship;
        }

        this.setState({ relationships }, () => {
            this.setState({ loading: false });
            this.toggleModal(false);
            showNotify(t('Notification'), t('Data has been updated!'));
        });
    }

    /**
     * @render
     */
    render() {
        let { t, match } = this.props;
        let { id } = match.params;

        const constTablist = tabConfig(id);

        const columns = [
            {
                title: t('No.'),
                render: r => this.state.relationships.indexOf(r) + 1
            },
            {
                title: 'Name',
                dataIndex: 'name'
            },
            {
                title: t('Relationship'),
                dataIndex: 'relationship',
            },
            {
                title: t('Phone'),
                dataIndex: 'phone',
            },
            {
                title: 'Action',
                align: 'center',
                width: 100,
                render: r => (
                    <>
                        <Button
                            type="primary"
                            size='small'
                            onClick={() => this.onEditRelationship(r.id)}
                            icon={<FontAwesomeIcon icon={faPen} />}>
                        </Button>
                        <Popconfirm title={t('Confirm delete selected item?')}
                            placement="topLeft"
                            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                            onConfirm={(e) => this.onDeleteRelationship(e, r.id)}
                        >
                            <Button
                                type="primary"
                                size='small'
                                style={{ marginLeft: 8 }}
                                onClick={e => e.stopPropagation()}
                                icon={<FontAwesomeIcon icon={faTrashAlt} />}>
                            </Button>
                        </Popconfirm>
                    </>
                )
            }
        ];

        return (
            <>
                <PageHeader title={t('Add relationship for staff')} tags={
                    <Button key="create-staff" type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => this.onEditRelationship()}>
                        &nbsp;{t('Add new')}
                    </Button>}
                />
                <Row className="card p-3 pt-0 mb-3">
                    <Tab tabs={constTablist} />
                    <Form ref={this.formRef} className="pt-3" name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={24}>
                            <Col span={4}>
                                <FormItem name="keywords">
                                    <Input placeholder={t('Keywords')} />
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <FormItem name="s">
                                    <Input placeholder={t('Keywords')} />
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <FormItem name="date_type">
                                    <Input placeholder={t('Date Type')} />
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <FormItem name="source">
                                    <Input placeholder={t('Source')} />
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <FormItem name="status">
                                    <Input placeholder={t('Status')} />
                                </FormItem>
                            </Col>
                            <Col span={4} key='submit'>
                                <Button type="primary" htmlType="submit">
                                    {t('Search')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Table
                            dataSource={this.state.relationships.length ? this.state.relationships : []}
                            columns={columns}
                            loading={this.state.loading}
                            pagination={{ pageSize: 1000, hideOnSinglePage: true }}
                            rowKey={(relationship) => relationship.id}
                        />
                    </Col>
                </Row>

                {/* <Modal
                    forceRender
                    title={t('Relationship')}
                    open={this.state.visible}
                    cancelText={<FontAwesomeIcon icon={faTimes} />}
                    onCancel={() => this.toggleModal(false)}
                    cancelButtonProps={{ danger: true }}
                    okText={<FontAwesomeIcon icon={faCheck} />}
                    onOk={this.handleFormSubmit.bind(this)}
                    width='40%'>
                    <Form
                        preserve={false}
                        ref={this.formRef}
                        layout="vertical">
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem name="id" hidden >
                                    <Input />
                                </FormItem>
                                <FormItem label={t('Name')} name="name" hasFeedback rules={[{ required: true, message: t('Please input name') }]}>
                                    <Input placeholder="Name" />
                                </FormItem>
                            </Col>
                            <Col span={6}>
                                <FormItem label={t('Relationship')} name="relationship" hasFeedback rules={[{ required: true, message: t('Please input relationship') }]}>
                                    <Input placeholder="Relationship" />
                                </FormItem>
                            </Col>
                            <Col span={6}>
                                <FormItem label={t('Phone')} name="phone" hasFeedback rules={[{ required: true, message: t('Please input phone number') }]}>
                                    <Input placeholder="Phone number" />
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </Modal> */}
            </>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        baseData: state.baseData
    };
}
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Member));
