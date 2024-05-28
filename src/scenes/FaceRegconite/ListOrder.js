import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Button, Row, Col, Image, Form, DatePicker, Table } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import Tab from '~/components/Base/Tab';
import DropDown from '~/components/Base/Dropdown';
import { getList} from '~/apis/faceRegconite/order'
import tabListFaceRegconite from '../Company/config/tabListFaceRegconite';
import { historyParams} from '~/services/helper';
import './config/listbadface.css';

const { RangePicker } = DatePicker;

class ListOrder extends Component {
    constructor(props) {
        super(props)
        let params = historyParams();
        this.state = {
            datas: [],
            loading: false,
            limit: 30,
            page: params.page ? Number(params.page) : 1,
            loadingTable : false
        }
        this.formRef = React.createRef();
        const {t} = this.props
        this.arrStatus = {0:t('hr:not_found') + (' ') + t('image'), 1: t('Ok')}
    }
    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getListOrder();
    }
    getListOrder = async (params = {}) => {
        this.setState({ loading: true })
        params = {
            ...params,
            page: this.state.page,
            limit: this.state.limit
        }
        let response = await getList(params)
        this.setState({datas : response.data.rows  , loading : false , total : response.data.total})
    }
    /**
     * @event change page
     * 
     * @param {*} page 
     */
     onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getListOrder(values));
    }
    submitForm = (values) => {
        this.setState({ page: 1 }, () => this.getListOrder(values));
    }
    render() {
        let { t ,baseData: {locations}} = this.props;
        const columns = [
                {
                    title: t('receipt'),
                    dataIndex: 'order_id'
                },
                {
                    title: t('store'),
                    dataIndex: 'store_name'
                },
                {
                    title: t('time'),
                    dataIndex: 'order_date'
                },
                {
                    title: t('image'),
                    render : r =>  r.image ? <Image style={{width : 320 , height : 100 }} src={r.image} /> : ''
                },
                {
                    title: t('status'),
                    render: r => typeof this.arrStatus[r.status] !== 'undefined' ? this.arrStatus[r.status] : '',
                }
        ]
        
        return (
            <div>
                <PageHeader title={t('receipt')} />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabListFaceRegconite(this.props)} />
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical">
                        <Row gutter={12}>
                            <Col span={3}>
                                <Form.Item name='location_id'>
                                    <DropDown datas={locations} defaultOption={t('hr:all_location')}/>
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item name='date'>
                                    <RangePicker className='w-100'/>
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Form.Item name="status" >
                                    <DropDown datas={this.arrStatus} defaultOption={t('hr:all_status')}/>
                                </Form.Item>
                            </Col>
                            <Col span={2}>
                                <Button type="primary" style={{ marginLeft: 8 }} htmlType="submit">
                                    {t('search')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
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
                                showQuickJumper : true
                            }}
                            rowKey={(row , index) => row.id}
                            rowClassName={(r) =>  (r.image)? '' : 'bg-warning'}
                        />
                    </Col>
                </Row>
            </div>
        )
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

export default connect(mapStateToProps, mapDispatchToProps)((ListOrder));
