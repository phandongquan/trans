import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Button, Row, Col, Image, Form, DatePicker, Input, Modal, Table, Spin, Upload, Slider, Select, Checkbox, Tabs, Avatar } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
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
import { mineTypeImage } from '~/constants/basic';
import debounce from 'lodash/debounce';
import LazyLoad from 'react-lazy-load';
import ModalEditCustomer from './ModalEditCustomer_v3';
import { getESLog, getReturningRate } from '~/apis/aiFaceLog/index_v3';


const { RangePicker } = DatePicker;

export class ListCustomerCount_v3 extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        let params = historyParams();
        let page = 1;
        let limit = 20;
        if (params.offset) {
            page = params.offset / limit + 1;
        }
        this.state = {
            datas: [],
            loading: false,
            limit,
            page,
            total: 2000,
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
            this.getListCount(values)
        })
    }
    getListCount = async (params = {}) => {
        params = {
            ...params,
            from_date: params.date?.length ? dayjs(params.date[0]).format('YYYY-MM-DD') : null,
            to_date: params.date?.length ? dayjs(params.date[1]).format('YYYY-MM-DD') : null
        }
        delete params.date
        this.setState({ loading: true })
        let response = await getReturningRate({
            ...params,
            limit: this.state.limit,
            offset: (this.state.page - 1) * this.state.limit
        });
        this.setState({ datas: response?.returned_customer_list, loading: false, total: (this.state.limit * response?.max_page) })
    }
    handleSubmitFormCount() {
        this.formRef.current.validateFields()
            .then((values) => {
                this.setState({ page: 1 }, () => this.getListCount(values))
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
    onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        values = {
            ...values,
            from_date: values.date ? values.date[0].startOf('day').format('YYYY-MM-DD 00:00:00') : null,
            to_date: values.date ? values.date[1].endOf('day').format('YYYY-MM-DD HH:mm:ss') : null
        }
        delete (values.date, values.keywords);
        Object.keys(values).forEach((k) => (values[k] == null || values[k] == '') && delete values[k]);
        this.setState({ page }, () => this.getListCount(values));
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
                    this.setState({ dataDetail: response.log_list[0], visible: true })
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
        const columns = [
            // {
            //     title: 'Customer Id',
            //     dataIndex: 'customer_id'
            // },
            // {
            //     title: 'Name',
            //     dataIndex: 'name'
            // },
            {
                title: t('customer'),
                render: r => <div className="d-flex align-items-center">
                    <div>
                        <LazyLoad className={'item-image'}>
                            <Avatar
                                size={58}
                                src={<Image src={r.face_image_url} />}
                            />
                        </LazyLoad>
                    </div>
                    <div className="ml-2">
                        <div>
                            {r.name}
                        </div>
                        <small>{r.customer_id}</small>
                    </div>
                </div>

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
                title: t('count'),
                align: 'center',
                dataIndex: 'count'
            },
            {
                title: t('store'),
                dataIndex: 'branch'
            },
            {
                title: t('action'),
                render: r =>
                    staff_info.staff_dept_id == 133 ?
                        <> <Button className='mr-2' type='primary' size='small' icon={<FontAwesomeIcon icon={faFilter} />}
                            onClick={() => {
                                this.setState({ loading: true })
                                let values = this.formRef.current.getFieldsValue()
                                this.props.onSearchCustomer_id(r.customer_id, values)
                            }} />
                            <Button className='mr-2' type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />}
                                onClick={() => this.getDetailCustomer(r.customer_id)}
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
                onFinish={this.handleSubmitFormCount.bind(this)}
                layout="vertical">
                <Row gutter={12}>
                    <Col span={5}>
                        <Form.Item name='date' hasFeedback rules={[{ required: true, message: t('choose_date') }]}>
                            <RangePicker className='w-100' />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="shop_id" >
                            <Dropdown datas={locations} defaultOption={t('all_location')} />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Button type="primary" style={{ marginLeft: 8 }} htmlType="submit">
                            {t('search')}
                        </Button>
                    </Col>
                </Row>
            </Form>
            <Table
                dataSource={this.state.datas}
                columns={columns}
                loading={this.state.loading}
                pagination={{
                    total: this.state.total,
                    pageSize: this.state.limit,
                    hideOnSinglePage: true,
                    showSizeChanger: false,
                    current: this.state.page,
                    onChange: page => this.onChangePage(page),
                    showQuickJumper: true
                }}
                rowKey={r => uniqueId(r.customer_id)}
            // rowClassName={(r) => r?.checked ? 'bg-checked' : ''}
            />
            {
                this.state.visible ?
                    <ModalEditCustomer
                        data={this.state.dataDetail}
                        visible={this.state.visible}
                        onCancel={() => this.setState({ visible: false, dataDetail: {} })}
                        onSubmitSuccess={() => {
                            let values = this.formRef.current.getFieldsValue();
                            this.getListCount(values);
                            this.setState({ visible: false, dataDetail: {} });
                        }}
                    /> : []
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

export default connect(mapStateToProps, mapDispatchToProps)(ListCustomerCount_v3)