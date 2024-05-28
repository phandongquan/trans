import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Button, Row, Col, Image, Form, DatePicker, Input, Modal, Table ,Spin, InputNumber, Avatar } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import Tab from '~/components/Base/Tab';
import { getListFacelogDebug ,deleteCustomer ,getDebug , deleteLogCustomer} from '~/apis/faceRegconite/faceRegconite'
import tabListFaceRegconite from '../Company/config/tabListFaceRegconite';
import { historyParams ,timeFormatStandard ,showNotify, checkPermission } from '~/services/helper';
import axios from 'axios';
import dayjs from 'dayjs';
import { uniqueId } from 'lodash';
import { faPlus, faTrashAlt , faBug } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './config/listbadface.css';
import Dropdown from '~/components/Base/Dropdown'
import { typeGender } from '~/constants/basic';
import LazyLoad from 'react-lazy-load';

const dateTimeFormat = 'YYYY-MM-DD'
const { RangePicker } = DatePicker;

class ListCustomer extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();

        let params = historyParams();
        let page = 1;
        let limit = params.limit ? params.limit : 100;
        if (params.offset) {
            page = params.offset / limit + 1;
        }

        this.state = {
            datas: [],
            loading: false,
            limit,
            page ,
            total: 2000,

            dataDetail : [],
            loadingTable : false,
            visibleModal: false,
            dataAddList : [] , 
            visibleForm : false,
            nameDetail : '',
            infoDebug : {},
            visibleDebug : false,
            loadingDebug : false
        }
    }
    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getListFace();
    }
    getListFace = async (params = {}) => {
        this.setState({ loading: true })
        params = {
            ...params,
            limit: this.state.limit,
            offset: (this.state.page - 1) * this.state.limit
        }
        let response = await getListFacelogDebug(params)
        this.setState({datas : response.log_list  , loading : false , total : (this.state.limit * response.maxpage)})
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
            ip : values.IP ? values.IP : null ,
            starting_date : values.date ? values.date[0].startOf('day').format('YYYY-MM-DD') : null,
            ending_date : values.date ? values.date[1].endOf('day').format('YYYY-MM-DD') : null
        }
        delete(values.date , values.keywords);
        Object.keys(values).forEach((k) => ( values[k] == null || values[k] == '') && delete values[k]);
        this.setState({ page }, () => this.getListFace(values));
    }
    /**
     * render images customer
     */
     renderImageCustumer(r,i) {
        const newDatas = [...this.state.datas];
        // const index = newDatas.findIndex((item) => r.customer_id === item.customer_id);
        const item = newDatas[i];
        r = {
            ...r,
            checked: 1
        }
        newDatas.splice(i, 1, { ...item, ...r });
        
        this.setState({loadingTable : true , visibleModal: true , datas : newDatas})
        let bodyFormData = new FormData();
        bodyFormData.append('customer_id', r.customer_id);
        axios.post(`https://ai.hasaki.vn/face/log?customer_id=${r.customer_id}`)
            .then(response =>
                this.setState({loadingTable : false , dataDetail : response.data.log_list , dataAddList: response.data.add_list })
            )
            .catch(error => console.log(error))
    }
    onDelete = (e, id ,index , phone) =>{
        let {dataAddList} = this.state
        const {t} =  this.props;
        e.stopPropagation();
        let params = {
            id: id,
            phone: phone
        }
        let xhr = deleteCustomer(params);
        xhr.then((response) => {
            showNotify('Notification', t('hr:delete_complete'))
            // this.getListFace()
            dataAddList.splice(index, 1)
            this.setState({dataAddList : dataAddList})
        })
    }
    renderAddList = () => {
        const {dataAddList} = this.state;
        let arrImgs = [];
        if (Array.isArray(dataAddList)) {
            dataAddList.map((d, index) => {
                arrImgs.push({
                    src: d.image,
                    id : d.id ,
                    index : index ,
                    origin_src : d.origin_image ? d.origin_image : '',
                    phone : d.phone,
                    landmark : d.landmark ? d.landmark : '',
                    crop_image_url : d.image ? d.image : ''
                });
            })
        }
        const sizeChunk = 4;
        let result = [];

        this.chunk(arrImgs, sizeChunk).map((arrChunk, index) => {
            let arrCol = [];
            if (Array.isArray(arrChunk)) {
                arrChunk.map(i => {
                    arrCol.push(<Col key={uniqueId('__face_img')} span={6} className='mb-2'>
                        <div className='mr-2 mb-3' style={{ boxShadow: 'rgb(0 0 0 / 10%) 1.3px 2.7px 5px 0px' }}>
                            <div className='d-flex justify-content-between'>
                                {
                                    i.src ?
                                        <Image src={i.src}
                                            style={{ width: '140px', height: '140px' }} />
                                        : []
                                }
                                {
                                    i.origin_src ?
                                        <Image src={i.origin_src}
                                            style={{ width: '140px', height: '140px' }} />
                                        : []
                                }
                                <div>
                                    {
                                        checkPermission('hr-tool-face-regconite-log-delete') ?
                                            <Button className='mr-2' icon={<FontAwesomeIcon icon={faTrashAlt} />} onClick={(e) => this.onDelete(e, i.id, i.index, i.phone)} />
                                            : ''
                                    }
                                    <br />
                                    {
                                        i.landmark ?
                                            <Button className='mr-2 mt-1' icon={<FontAwesomeIcon icon={faBug}/>} 
                                            onClick={() => this.getImgDebug({ full_image_url: i.origin_src, landmark: i.landmark , crop_image_url : i.crop_image_url})}/>
                                            : []
                                    }
                                </div>
                                
                            </div>

                            <div className='mb-1 p-1' style={{ height: 35 }}>
                                {i.id ?
                                    <div className='d-flex justify-content-between align-items-end mr-1'>
                                        <div className='mt-2' style={{ lineHeight: '1.2' }}>
                                            <small>ID : {i.id} </small><br />
                                        </div>
                                    </div>
                                    : ''}
                            </div>
                        </div>
                    </Col>
                    )
                })
            }
            result.push(<Row key={index}>{arrCol}</Row>)
        })
        return result;
    }
    /**
     * Chunk array
     * @param {*} arr 
     * @param {*} size 
     * @returns 
     */
     chunk = (arr, size) =>
     Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
         arr.slice(i * size, i * size + size)
     );
    submitForm () {
        let values = this.formRef.current.getFieldsValue();
        values = {
            ...values,
            ip : values.IP ? values.IP : null ,
            starting_date : values.date ? values.date[0].startOf('day').format('YYYY-MM-DD') : null,
            ending_date : values.date ? values.date[1].endOf('day').format('YYYY-MM-DD') : null
        }
        delete(values.date);
        Object.keys(values).forEach((k) => ( values[k] == null || values[k] == '') && delete values[k]);
        this.setState({ page : 1 }, () => this.getListFace(values));

    }
    getImgDebug (r) {
        this.setState({loadingDebug : true ,visibleDebug : true,})
        let params = {
            full_image_url: r.full_image_url,
            landmark: r.landmark,
            crop_image_url : r.crop_image_url
        }
        let xhr = getDebug(params)
        xhr.then(res =>{
            if(res.status){
                this.setState({ infoDebug : res , loadingDebug : false})
            }
        })
    }
    ondeleteLog(r , index){
        let params = {
            log_id : r.id
        }
        const {t} =  this.props;
        let xhr = deleteLogCustomer(params)
        xhr.then(res => {
            showNotify('Notification', t('hr:delete_complete'))
            let newDataLogList = this.state.dataDetail.slice()
            newDataLogList.splice(index, 1)
            this.setState({ dataDetail: newDataLogList })
        })
        
    }
    render() {
        let { t ,baseData: {locations}} = this.props;
        const columns = [
                {
                    title: t('customer'),
                    render: (t, r, i)  => <div className="d-flex align-items-center">
                        <div>
                            <LazyLoad className={'item-image'}>
                                <Avatar
                                    size={58}
                                    src={<Image src={r.crop_image_url} />}
                                />
                            </LazyLoad>
                        </div>
                        <div className="ml-2">
                            {
                                checkPermission('hr-tool-face-regconite-log-preview') ?
                                    <div style={{ marginTop: '17px', color: '#009aff', cursor: 'pointer' }}
                                        onClick={() => this.setState({ nameDetail: r.customer_name, infoDebug: '' }, () => this.renderImageCustumer(r, i))}>
                                        {r.customer_name}
                                    </div>
                                    : 
                                    <div style={{ marginTop: '17px', color: '#009aff' }}>
                                        {r.customer_name}
                                    </div>
                            }
                            <small>Id: {r.id}</small><br/>
                            <small>Customer Id: {r.customer_id}</small>
                        </div>
                    </div>
    
                },
                {
                    title: t('hr:face_index_id'),
                    dataIndex: 'face_index_id'
                },
                {
                    title: t('distance'),
                    dataIndex: 'distance'
                },
                {
                    title: 'IP',
                    dataIndex: 'ip'
                },
                {
                    title : t('gender'),
                    render: r => typeGender[r.gender]
                },
                {
                    title : t('age'),
                    dataIndex   : 'age'
                },
                // {
                //     title: 'Crop image',
                //     render : r => <Image style={{width : 110 , height : 115 }} src={r.crop_image_url} />
                // },
                {
                    title: t('hr:full_image'),
                    render : r =>  r.full_image_url ? <Image style={{ width: 180, height: 80 ,objectFit:'cover' }} src={r.full_image_url} /> : ''
                },
                {
                    title: t('appeared_time'),
                    render : r => dayjs(r.appeared_time).utc(0).format(dateTimeFormat)
                },
                {
                    title: t('store'),
                    dataIndex: 'client_name'
                },
                // {
                //     title: 'Action',
                //     render: r => r.origin_image ? <Button type="primary" size='small' icon={<FontAwesomeIcon icon={faPlus} />}
                //         onClick={() => this.setState({ visibleForm: true })}
                //     /> : ''
                // }
        ]
        const columnsModal = [
            {
                title: t('customer'),
                render: r => <div className="d-flex align-items-center">
                    <div>
                        <Avatar
                            size={58}
                            src={<Image src={r.crop_image_url} />}
                        />
                    </div>
                    <div className="ml-2">
                        {/* <div>
                            {r.customer_name}
                        </div> */}
                        <small>Id: {r.id}</small><br/>
                        <small>Customer Id: {r.customer_id}</small>
                    </div>
                </div>

            },
            {
                title: t('distance'),
                dataIndex: 'distance'
            },
            {
                title: t('hr:face_index_id'),
                dataIndex: 'face_index_id'
            },
            {
                title: 'IP',
                dataIndex: 'ip'
            },
            {
                title : t('gender'),
                render: r => typeGender[r.gender]
            },
            {
                title : t('age'),
                dataIndex   : 'age'
            },
            // {
            //     title: 'Crop image',
            //     render : r => <Image style={{width : 115 , height : 115 }} src={r.crop_image_url} />
            // },
            {
                title: t('hr:full_image'),
                render:  (text , r ,index) => r.full_image_url ?
                    <div className='d-flex justify-content-between'>
                        <Image style={{ width: 180, height: 80  ,objectFit:'cover'  }} src={r.full_image_url} />
                        {/* <Button className='mr-2' icon={<FontAwesomeIcon icon={faBug} />} onClick={() => this.getImgDebug(r)}/> */}
                        <div>
                            {checkPermission('hr-tool-face-regconite-log-delete') ? 
                                <Button className='mr-2' icon={<FontAwesomeIcon icon={faTrashAlt} />} onClick={(e) => this.ondeleteLog(r, index)} /> 
                                : ''
                            }
                            <br />
                            {
                                r.landmark ?
                                    <Button className='mr-2' icon={<FontAwesomeIcon icon={faBug} />} onClick={() => this.getImgDebug(r)} />
                                    : []
                            }
                        </div>
                    </div>
                    : ''
            },
            {
                title: t('time'),
                render : r => r.appeared_time ? dayjs(r.appeared_time).utc().format(dateTimeFormat) : ''
            },
            {
                title: t('store'),
                dataIndex: 'client_name'
            },
        ]
        return (
            <div>
                <PageHeader title={t('hr:face_log_debug')} />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabListFaceRegconite(this.props)} />
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical">
                        <Row gutter={12}>
                            {/* <Col span={5}>
                                <Form.Item name="keywords">
                                    <Input placeholder={t('keywords')} />
                                </Form.Item>
                            </Col> */}
                            <Col span={3}>
                                <Form.Item name="IP" >
                                    <Input placeholder="IP" />
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item name='date'>
                                    <RangePicker className='w-100'/>
                                </Form.Item>
                            </Col>
                            <Col span={2}>
                                <Form.Item name='gender'>
                                    <Dropdown datas= {typeGender} defaultOption={t('gender')} />
                                </Form.Item>
                            </Col>
                            <Col span={2}>
                                <Form.Item name='from_age'>
                                    <InputNumber placeholder={t('hr:form_age')} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={2}>
                                <Form.Item name='to_age'>
                                    <InputNumber placeholder={t('hr:to_age')} style={{ width: '100%' }}/>
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
                            rowKey={(project , index) => project.id}
                            rowClassName={(r) =>  r?.checked ? 'bg-checked' : ''}
                            
                        />
                    </Col>
                </Row>
                <Modal
                    title={t ('information') + ` : ${this.state.nameDetail}`}
                    open={this.state.visibleModal}
                    onCancel={() => this.setState({ visibleModal: false })}
                    onOk={() => { }}
                    width = {this.state.dataDetail.length < 1 && this.state.dataAddList.length < 1? '20%' : 'auto'}
                    footer={false}
                    >
                        {
                            this.state.dataDetail.length < 1 && this.state.dataAddList.length < 1 ?
                            t('no_data')
                            :
                            <>
                                <PageHeader title={t('hr:add_list')} />
                                {this.renderAddList()}
                                <PageHeader title={t('hr:log_list')} />
                                <Table
                                    className={<strong>detail-customer</strong>}
                                    dataSource={this.state.dataDetail}
                                    columns={columnsModal}
                                    loading={this.state.loadingTable}
                                    rowKey='id'
                                    pagination={{ pageSize: 5 }}
                                />
                            </>
                            
                        }
                </Modal>
                {/* <Modal
                    title="Add customer"
                    open={this.state.visibleForm}
                    onCancel={() => this.setState({ visibleForm: false })}
                    onOk={() => { }}
                // footer={false}
                >

                </Modal> */}
                <Modal
                    title={t('hr:image_debug')}
                    open={this.state.visibleDebug}
                    onCancel={() => this.setState({visibleDebug : false})}
                    footer={false}
                >
                    <Spin spinning= {this.state.loadingDebug}>
                        <div className='d-flex'>
                            <Image src={`data:image/jpeg;base64,${this.state.infoDebug?.image}`} />
                            <span className='ml-3' style={{fontSize :20}}>{this.state.infoDebug.black_rate}</span>
                        </div>

                    </Spin>
                </Modal>
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

export default connect(mapStateToProps, mapDispatchToProps)((ListCustomer));
