import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Button, Table, Row, Col, Input, Popconfirm, Form, Modal, DatePicker } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faPen, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { getByStaff as getRelationByStaff, create, update, destroy } from '~/apis/company/staff/practising-certificate';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Dropdown from '~/components/Base/Dropdown';
import Tab from '~/components/Base/Tab';
import tabConfig from './config/tab';
import { timeFormatStandard, showNotify } from '~/services/helper';

const FormItem = Form.Item;
class StaffPractisingCertificate extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            visible: false,
            practisingCertificates: []
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
     * Get list practisingCertificate for staff
     * @param {} params 
     */
    async getData(params = {}) {
        this.setState({ loading: true });
        let { match } = this.props;
        let { id } = match.params;
        /**
         * @fetch API
         */
        let practisingCertificateXhr = await getRelationByStaff(id);
        let practisingCertificates = (practisingCertificateXhr.status == 1) ? practisingCertificateXhr.data.rows : {};

        this.setState({ practisingCertificates }, () => this.setState({ loading: false }));
    }

    /**
     * @event toggle modal
     * @param {*} visible 
     */
    toggleModal(visible) {
        this.setState({ visible });
    }

    /**
     * @event delete practisingCertificate
     * @param {*} e 
     * @param {*} id 
     */
    async onDeletePractisingCertificate(e, id) {
        this.setState({ loading: true });
        let xhr = await destroy(id);
        let result = (xhr.status == 1) ? xhr.data : {};
        if (result) {
            let practisingCertificates = [...this.state.practisingCertificates];
            let index = practisingCertificates.indexOf(practisingCertificates.find(r => r.id == id));

            /**
             * Update new list
             */
            practisingCertificates.splice(index, 1);
            this.setState({ practisingCertificates });

            let { t } = this.props;
            showNotify(t('Notification'), t('Data has been deleted!'));
        }
        this.setState({ loading: false });
    }

    /**
     * @event before show modal edit practisingCertificate
     * @param {*} id 
     */
    onEditPractisingCertificate(id = null) {
        this.toggleModal(true);
        if (!id) {
            this.formRef.current.resetFields();
        } else {
            let { practisingCertificates } = this.state;
            let data = practisingCertificates.find(r => r.id == id);
            data['expire_date'] = data['expire_date'] ? dayjs(data['expire_date']) : dayjs();
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
        let response;
        this.setState({ loading: true });
        let { t, match } = this.props;
        let staff_id = match.params.id;
        let submitData = {
            ...values,
            expire_date: (values['expire_date'] ? values['expire_date'].format('YYYY-MM-DD') : null),
            staff_id
        }
        if (values.id) {
            response = await update(values.id, submitData);
        } else {
            response = await create(submitData);
        }

        let practisingCertificate = (response.status == 1) ? response.data.staff_practising_certificate : {};
        let practisingCertificates = [...this.state.practisingCertificates];

        /**
         * Update new list
         */
        if (!values.id) {
            practisingCertificates.push(practisingCertificate);
        } else {
            let index = practisingCertificates.indexOf(practisingCertificates.find(r => r.id == practisingCertificate.id));
            practisingCertificates[index] = practisingCertificate;
        }

        this.setState({ practisingCertificates }, () => {
            this.setState({ loading: false });
            this.toggleModal(false);
            showNotify(t('Notification'), t('Data has been updated!'));
        });
    }

    /**
     * @render
     */
    render() {
        let { t, match, baseData: { cities } } = this.props;
        let { id } = match.params;

        const constTablist = tabConfig(id);

        const columns = [
            {
                title: t('No.'),
                render: r => this.state.practisingCertificates.indexOf(r) + 1
            },
            {
                title: 'Code',
                dataIndex: 'code'
            },
            {
                title: 'Name',
                dataIndex: 'name'
            },
            {
                title: t('Specialized'),
                dataIndex: 'specialized',
            },
            {
                title: t('Place'),
                render: r => r.place && cities[r.place] ? cities[r.place] : ''
            },
            {
                title: t('Expire Date'),
                render: r => r.expire_date ? timeFormatStandard(r.expire_date, 'YYYY-MM-DD') : ''
            },
            {
                title: 'Action',
                align: 'center',
                render: r => (
                    <>
                        <Button
                            type="primary"
                            size='small'
                            onClick={() => this.onEditPractisingCertificate(r.id)}
                            icon={<FontAwesomeIcon icon={faPen} />}>
                        </Button>
                        <Popconfirm title={t('Confirm delete selected item?')}
                            placement="topLeft"
                            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                            onConfirm={(e) => this.onDeletePractisingCertificate(e, r.id)}
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
                <PageHeader title={t('Add Practising Certificate for staff')} tags={
                    <Button key="create-staff" type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => this.onEditPractisingCertificate()}>
                        &nbsp;{t('Add new')}
                    </Button>}
                />
                <Row className="card p-3 pt-0 mb-3">
                    <Tab tabs={constTablist} />
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Table
                            dataSource={this.state.practisingCertificates.length ? this.state.practisingCertificates : []}
                            columns={columns}
                            loading={this.state.loading}
                            pagination={{ pageSize: 1000, hideOnSinglePage: true }}
                            rowKey={(practisingCertificate) => practisingCertificate.id}
                        />
                    </Col>
                </Row>

                <Modal
                    forceRender
                    title={t('Practising Certificate')}
                    open={this.state.visible}
                    onCancel={() => this.toggleModal(false)}
                    // cancelText={<FontAwesomeIcon icon={faTimes} />}
                    // cancelButtonProps={{ danger: true }}
                    // okText={<FontAwesomeIcon icon={faCheck} />}
                    okText='Save'
                    onOk={this.handleFormSubmit.bind(this)}
                    width={1000}>
                    <Form
                        preserve={false}
                        ref={this.formRef}
                        layout="vertical">
                        <Row gutter={[12, 0]}>
                            <Col span={5}>
                                <FormItem name="id" hidden >
                                    <Input />
                                </FormItem>
                                <FormItem label={t('Name')} name="name" hasFeedback rules={[{ required: true, message: t('Please input name') }]}>
                                    <Input placeholder="Name" />
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <FormItem label={t('Code')} name="code" hasFeedback rules={[{ required: true, message: t('Please input code') }]}>
                                    <Input placeholder="Code" />
                                </FormItem>
                            </Col>
                            <Col span={6}>
                                <FormItem label={t('Specialized')} name="specialized" hasFeedback rules={[{ required: true, message: t('Please input specialized') }]}>
                                    <Input placeholder="Specialized" />
                                </FormItem>
                            </Col>
                            <Col span={5}>
                                <FormItem label={t('Place')} name="place" hasFeedback rules={[{ required: true, message: t('Please input place') }]}>
                                    <Dropdown datas={cities} defaultOption="-- All Place --" />
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <FormItem label={t('Place')} name="expire_date" hasFeedback rules={[{ required: true, message: t('Please input expire date!') }]}>
                                    <DatePicker placeholder="Expire Date" />
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffPractisingCertificate));
