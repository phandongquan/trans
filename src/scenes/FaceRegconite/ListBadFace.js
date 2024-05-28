import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getList , updatedFace } from '~/apis/faceRegconite/faceBad'
import { deleteCustomer} from '~/apis/faceRegconite/faceRegconite'
import { Button, Row, Col, Image, Form, Pagination, Input ,Modal, Table } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import Tab from '~/components/Base/Tab';
import tabListFaceRegconite from '../Company/config/tabListFaceRegconite';
import dayjs from 'dayjs';
import { uniqueId } from 'lodash';
import axios from 'axios';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { timeFormatStandard ,showNotify} from '~/services/helper'
import './config/listbadface.css'

const dateTimeFormat = 'YYYY-MM-DD HH:mm'

class ListBadFace extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            datas: [],
            visible: false,
            loading: false,
            customer_id_update : 0 ,
            limit: 36,
            page: 1,
            total: 0,
            toggler: false,
            slide: 1,
            visibleModal :false,
            loadingTable: false,
            dataAddList : []
        }
    }
    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getListFace();
    }
    /**
     * Get list
     * @param {Object} params 
     */
    getListFace = async (params = {}) => {
        params = {
            ...params,
            page: this.state.page,
            limit: this.state.limit,
        }
        let response = await getList(params);
        if (response) {
            if(response.maxPage != null){
                this.setState({ datas: response.data , total : Number(response.maxPage *  this.state.limit) })
            }else {
                this.setState({
                    datas: response.data
                })
            }
            
        }
    }
    onDelete = (e, id , index,phone) =>{
        let {dataAddList} = this.state
        e.stopPropagation();
        let params = {
            id: id,
            phone: phone
        }
        let xhr = deleteCustomer(params);
        xhr.then((response) => {
            showNotify('Notification', 'Đã xoá thành công !')
            dataAddList.splice(index, 1)
            this.setState({dataAddList : dataAddList})
        })
    }
    /**
     * @event change page
     * 
     * @param {*} page 
     */
    onChangePage(page) {
        // let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getListFace());
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
    renderAddList = () => {
        const { dataAddList } = this.state;
        let arrImgs = [];
        if (Array.isArray(dataAddList)) {
            dataAddList.map((d, index) => {
                arrImgs.push({
                    src: d.image,
                    id: d.id,
                    index: index,
                    origin_src : d.origin_image ? d.origin_image : '',
                    phone : d.phone
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
                                    :[]
                                }
                                {
                                    i.origin_src ?
                                        <Image src={i.origin_src}
                                            style={{ width: '140px', height: '140px' }} />
                                    :[]
                                }
                                
                                <Button className='mr-2' icon={<FontAwesomeIcon icon={faTrashAlt} />} onClick={(e) => this.onDelete(e, i.id, i.index ,i.phone)} />
                            </div>
                            <div className='mb-1 p-1' style={{ height: 68 }}>
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
        return (
            <div>
                {result}
                <Button className='float-right m-10' onClick={() => this.submitFace()} type="primary" key={1}>Đạt yêu cầu</Button>
            </div>
        )
    }
    /**
     * render images customer
     */
     renderImageCustumer(id) {
        this.setState({loadingTable : true , visibleModal: true , customer_id_update : id})
        let bodyFormData = new FormData();
        bodyFormData.append('customer_id', id);

        axios.post(`https://ai.hasaki.vn/face/log?customer_id=${id}`)
            .then(response =>
                this.setState({loadingTable : false , dataAddList: response.data.add_list })
            )
            .catch(error => console.log(error))
    }
    renderContent(){
        const { datas } = this.state;
        let arrImgs = [];
        if (Array.isArray(datas)) {
            datas.map((d, index) => {
                arrImgs.push({
                    customer_id: d.customer_id,
                    name: d?.fullname,
                    src: d.image,
                    created_at: dayjs(d.created_at).utc(0).format('HH:mm DD/MM/YY'),
                    index: index,
                    phone: d.phone,
                    id : d.id,
                });
            })
        }
        const sizeChunk = 6;
        let result = [];

        this.chunk(arrImgs, sizeChunk).map((arrChunk, index) => {
            let arrCol = [];
            if (Array.isArray(arrChunk)) {
                arrChunk.map(i => {
                    arrCol.push(<Col key={uniqueId('__face_img')} span={4} className='mb-2'>
                        <div className='mr-2 mb-3' style={{ boxShadow: 'rgb(0 0 0 / 10%) 1.3px 2.7px 5px 0px' }}>
                            <div className='d-flex justify-content-between'>
                                <Image src={i.src}
                                    style={{ width: 'auto', height: '140px' }} />
                            </div>
                            <div className='mb-1 p-1' style={{ height: 68 }}>
                                {i.name ?
                                    <div className='d-flex justify-content-between align-items-end mr-1'>
                                        <div className='mt-2' style={{ lineHeight: '1.2' }}>
                                            <small onClick={() => this.renderImageCustumer(i.customer_id)} style={{color:'#009aff', cursor:'pointer'}}>{i.name} </small><br />
                                            <small>{i.phone} </small>
                                        </div>
                                        <div className='text-muted float-right mt-2' style={{ lineHeight: '1.2' }}>
                                            <small >{i.customer_id}</small><br />
                                            <small style={{ fontSize: 10 }}>{i.created_at}</small>
                                        </div>
                                    </div>
                                    : ''}
                            </div>
                            {/* <div className='ml-1' style={{height : 50}}>
                                <small >
                                    Message : {i.message}
                                </small>
                            </div> */}
                            
                        </div>
                    </Col>
                    )
                })
            }
            result.push(<Row key={index}>{arrCol}</Row>)
        })
        return result;
    }
    submitFace = async () => {
        let params = {
            updateKeys: ['high_distance'],
            updateValues : [0],
            conditionKeys : ['customer_id'],
            conditionValues : [this.state.customer_id_update]
        }
        let response = await updatedFace(params)
        if(response){
            showNotify('Notification', 'Đã cập nhật thành công !')
            this.setState({visibleModal : false})
        }
    }
    render() {
        let { t } = this.props;
        let { dataAddList } = this.state
        
        return (
            <div>
                <PageHeader title={t('list_face')} />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabListFaceRegconite(this.props)} />
                    {/* <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical">
                        <Row gutter={12}>
                            <Col span={5}>
                                <Form.Item name="keywords">
                                    <Input placeholder={t('Phone')} />
                                </Form.Item>
                            </Col>
                            <Col span={2}>
                                <Button type="primary" style={{ marginLeft: 8 }} htmlType="submit">
                                    {t('Search')}
                                </Button>
                            </Col>
                        </Row>
                    </Form> */}
                </Row>
                <div>
                    {this.renderContent()}
                </div>
                <div className='float-right'>
                    <Pagination
                        total={this.state.total}
                        pageSize={this.state.limit}
                        showSizeChanger={false}
                        current={this.state.page}
                        onChange={page => this.onChangePage(page)}
                        // showQuickJumper
                    />
                </div>
                <Modal
                    className='detail-bad-face'
                    title={t('detail_customer')}
                    open={this.state.visibleModal}
                    onCancel={() => this.setState({ visibleModal: false })}
                    width = { dataAddList.length  < 1 ? '20%' : 'auto'}
                    height = {'auto'}
                    footer={false}
                    >
                        {
                            dataAddList.length < 1 ?
                            t('no_data')
                            :
                            <>
                                <PageHeader title={t('add_list')} />
                                {this.renderAddList()}                     
                            </>
                            
                        }
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

export default connect(mapStateToProps, mapDispatchToProps)((ListBadFace));