import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Button, Row, Col, Image, Form, DatePicker, Input, Modal, Table, Spin, Upload, Slider, Select, Checkbox, Tabs, Avatar } from "antd";
import { convertToFormData, historyParams, showNotify } from '~/services/helper';
import axios from 'axios';
import dayjs from 'dayjs';
import { uniqueId } from 'lodash';
import { faCamera, faFilter, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './config/listbadface.css';
import Dropdown from '~/components/Base/Dropdown'
import DeleteButton from '~/components/Base/DeleteButton';
import { InboxOutlined } from '@ant-design/icons';
import { mineTypeImage, typeCustomer } from '~/constants/basic';
import debounce from 'lodash/debounce';
import LazyLoad from 'react-lazy-load';
import ModalEditCustomer from './ModalEditCustomer';
import { getReportCheckoutList, getESLog } from '~/apis/aiFaceLog'


const { RangePicker } = DatePicker;

export class HistoryCashierUse_v2 extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        // let params = historyParams();
        // let page = 1;
        // let limit = 100;
        // if (params.offset) {
        //     page = params.offset / limit + 1;
        // }
        this.state = {
            datasCheckIn: [],
            datasNotCheckIn: [],
            loadingCheckIn: false,
            loadingNotCheckIn: false,
            limit: 20,
            pageCheckIn: 1,
            pageNotCheckIn: 1,
            totalCheckIn: 2000,
            totalNotCheckIn: 2000,
            dataDetail: {},
            visible: false,
        }
    }
    /**
    * @lifecycle 
    */
    componentDidMount() {
        this.setState({ page: 1 }, () => {
            this.formRef.current.setFieldsValue({ date: [dayjs().subtract(7, 'd'), dayjs()] })
            let values = this.formRef.current.getFieldsValue()
            this.getListCheckIn(values)
            this.getListNotCheckIn(values)
        })
    }
    getListCheckIn = async (params = {}) => {
        this.setState({ loadingCheckIn: true })
        params = {
            ...params,
            from_date: params.date?.length ? dayjs(params.date[0]).format('YYYY-MM-DD') : null,
            to_date: params.date?.length ? dayjs(params.date[1]).format('YYYY-MM-DD') : null
        }
        delete params.date
        let response = await getReportCheckoutList({
            ...params,
            limit: this.state.limit,
            offset: (this.state.pageCheckIn - 1) * this.state.limit,
            checked_in: true
        })
        if (response) {
            this.setState({ datasCheckIn: response.data?.list, loadingCheckIn: false, totalCheckIn: (this.state.limit * response.data?.max_page) })
        }
    }
    getListNotCheckIn = async (params = {}) => {
        this.setState({ loadingNotCheckIn: true })
        params = {
            ...params,
            from_date: params.date?.length ? dayjs(params.date[0]).format('YYYY-MM-DD') : null,
            to_date: params.date?.length ? dayjs(params.date[1]).format('YYYY-MM-DD') : null
        }
        delete params.date
        let response = await getReportCheckoutList({
            ...params,
            limit: this.state.limit,
            offset: (this.state.pageNotCheckIn - 1) * this.state.limit,
            checked_in: false
        });
        if (response) {
            this.setState({ datasNotCheckIn: response.data?.list, loadingNotCheckIn: false, totalNotCheckIn: (this.state.limit * response.data?.max_page) })
        }
    }
    submitForm() {
        this.formRef.current.validateFields()
            .then((values) => {
                this.setState({ pageNotCheckIn: 1, pageCheckIn: 1 }, () => {
                    this.getListCheckIn(values)
                    this.getListNotCheckIn(values)
                })
            }
            )
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }
    /**
    * @event change page
    * 
    * @param {*} page 
    */
    onChangePage(page, isCheckIn = false) {
        let values = this.formRef.current.getFieldsValue();
        values = {
            ...values,
            from_date: values.date ? values.date[0].startOf('day').format('YYYY-MM-DD 00:00:00') : null,
            to_date: values.date ? values.date[1].endOf('day').format('YYYY-MM-DD HH:mm:ss') : null
        }
        delete (values.date, values.keywords);
        Object.keys(values).forEach((k) => (values[k] == null || values[k] == '') && delete values[k]);
        if (isCheckIn) {
            this.setState({ pageCheckIn: page }, () => this.getListCheckIn(values));
        } else {
            this.setState({ pageNotCheckIn: page }, () => this.getListNotCheckIn(values));
        }
        window.scrollTo(0, 0);
    }

    getDetailCustomer(id) {
        let xhr = getESLog({
            id,
            limit: 1,
            offset: 0
        })
        xhr.then(response => {
            if (response) {
                let arDatas = response.log_list
                if (arDatas.length) {
                    this.setState({ dataDetail: response.log_list[0], loadingCheckIn: false, visible: true })
                } else {
                    showNotify('Notification', 'Dữ liệu không có !', 'error')
                }
            } else {
                showNotify('Notification', response.message, 'error')
            }
        })
    }
    render() {
        let { baseData: { locations }, auth: { staff_info } } = this.props;
        let { t } = this.props.change_language;
        const columnsCheckIn = [
            {
                title: t('customer'),
                render: r => <div className="d-flex align-items-center">
                    <div>
                        <LazyLoad className={'item-image'}>
                            <Avatar
                                size={58}
                                src={<Image src={r.cropped_image_url} />}
                            />
                        </LazyLoad>
                    </div>
                    <div className="ml-2">
                        <div>
                            {r.name}
                        </div>
                        <small>{r.visitor_id}</small>
                    </div>
                </div>

            },
            {
                title: t('shop_count'),
                dataIndex: 'shop_count'
            },
            {
                title: t('cashier_count'),
                dataIndex: 'cashier_count'
            },
            {
                title: t('visit_count'),
                dataIndex: 'visit_count'
            },
            {
                title: t('full_image'),
                render: r => r.full_image_url ?
                    <LazyLoad className={'item-image'}>
                        <Image style={{ width: 180, height: 80, objectFit: 'cover' }} src={r.full_image_url} />
                    </LazyLoad>
                    : ''
            },
            {
                title: t('action'),
                width: '10%',
                align: 'center',
                render: r =>
                    staff_info.staff_dept_id == 133 ?
                        <> <Button className='mr-2' type='primary' size='small' icon={<FontAwesomeIcon icon={faFilter} />}
                            onClick={() => {
                                this.setState({ loadingCheckIn: true, loadingNotCheckIn: true })
                                let values = this.formRef.current.getFieldsValue()
                                this.props.onSearchCustomer_id(r.visitor_id, values)
                            }} />
                            <Button className='mr-2' type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />}
                                onClick={() => this.getDetailCustomer(r.visitor_id)}
                            />
                        </>
                        : []
            }
        ]
        const columnsNotCheckIn = [
            {
                title: t('customer'),
                render: r => <div className="d-flex align-items-center">
                    <div>
                        <LazyLoad className={'item-image'}>
                            <Avatar
                                size={58}
                                src={<Image src={r.cropped_image_url} />}
                            />
                        </LazyLoad>
                    </div>
                    <div className="ml-2">
                        <div>
                            {r.name}
                        </div>
                        <small>{r.visitor_id}</small>
                    </div>
                </div>

            },
            {
                title: t('shop_count'),
                dataIndex: 'shop_count'
            },
            {
                title: t('visit_count'),
                dataIndex: 'visit_count'
            },
            {
                title: t('full_image'),
                render: r => r.full_image_url ?
                    <LazyLoad className={'item-image'}>
                        <Image style={{ width: 180, height: 80, objectFit: 'cover' }} src={r.full_image_url} />
                    </LazyLoad>
                    : ''
            },
            {
                title: t('action'),
                width: '10%',
                align: 'center',
                render: r =>
                    staff_info.staff_dept_id == 133 ?
                        <>
                            <Button className='mr-2' type='primary' size='small' icon={<FontAwesomeIcon icon={faFilter} />}
                                onClick={() => {
                                    this.setState({ loadingCheckIn: true, loadingNotCheckIn: true })
                                    let values = this.formRef.current.getFieldsValue()
                                    this.props.onSearchCustomer_id(r.visitor_id, values)
                                }} />
                            <Button className='mr-2' type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />}
                                onClick={() => this.getDetailCustomer(r.visitor_id)}
                            />
                        </>
                        : []
            }
        ]
        return <>
            <Form
                className="pt-3"
                ref={this.formRef}
                name="searchForm"
                onFinish={this.submitForm.bind(this)}
                layout="vertical">
                <Row gutter={12}>
                    <Col span={5}>
                        <Form.Item name='date' hasFeedback rules={[{ required: true, message: t('choose_date') }]}>
                            <RangePicker className='w-100' />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="shop_id" >
                            <Dropdown datas={locations} defaultOption={t('all_store')} />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Button type="primary" style={{ marginLeft: 8 }} htmlType="submit">
                            {t('search')}
                        </Button>
                    </Col>
                </Row>
            </Form>
            <Row gutter={[12, 0]}>
                <Col span={12} >1   `ă3eqư23e4rr45dè`
                    <strong style={{ fontSize: 16 }}>Check in Cashier</strong>
                    <Table
                        dataSource={this.state.datasCheckIn}
                        columns={columnsCheckIn}
                        loading={this.state.loadingCheckIn}
                        pagination={{
                            total: this.state.totalCheckIn,
                            pageSize: this.state.limit,
                            hideOnSinglePage: false,
                            showSizeChanger: false,
                            current: this.state.pageCheckIn,
                            onChange: page => this.onChangePage(page, true),
                            showQuickJumper: false
                        }}
                        rowKey={r => uniqueId(r.customer_id)}
                    />
                </Col>
                <Col span={12} >
                    <strong style={{ fontSize: 16 }}>Not Check in Cashier</strong>
                    <Table
                        dataSource={this.state.datasNotCheckIn}
                        columns={columnsNotCheckIn}
                        loading={this.state.loadingNotCheckIn}
                        pagination={{
                            total: this.state.totalNotCheckIn,
                            pageSize: this.state.limit,
                            hideOnSinglePage: false,
                            showSizeChanger: false,
                            current: this.state.pageNotCheckIn,
                            onChange: page => this.onChangePage(page),
                            showQuickJumper: false
                        }}
                        rowKey={r => uniqueId(r.customer_id)}
                    />
                </Col>
            </Row>
            {
                this.state.visible ?
                    <ModalEditCustomer
                        data={this.state.dataDetail}
                        visible={this.state.visible}
                        onCancel={() => this.setState({ visible: false, dataDetail: {} })}
                        onSubmitSuccess={() => {
                            let values = this.formRef.current.getFieldsValue();
                            this.getListCheckIn(values);
                            this.getListNotCheckIn(values);
                            this.setState({ visible: false, dataDetail: {} })
                        }}
                    />
                    : []
            }

        </>
    }
}
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryCashierUse_v2)