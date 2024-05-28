import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { getList ,deleteCustomer , getDebug , deleteLogCustomer} from '~/apis/faceRegconite/faceRegconite'
import { Button, Row, Col, Image, Form, Pagination, Input ,Modal, Table ,Spin} from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { timeFormatStandard ,showNotify} from '~/services/helper'
import { uniqueId } from 'lodash';
// import './config/faceregconite.css'
import FsLightbox from 'fslightbox-react';
import Lightbox from 'react-image-lightbox';
import dayjs from 'dayjs';
import axios from 'axios';
import Tab from '~/components/Base/Tab';
import tabListFaceRegconite from '../Company/config/tabListFaceRegconite';
import { faTrashAlt ,faBug} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { typeGender } from '~/constants/basic';

const dateTimeFormat = 'YYYY-MM-DD HH:mm'

class FaceRegconite extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            datas: [],
            visible: false,
            loading: false,

            limit: 36,
            page: 1,
            total: 2000,
            toggler: false,
            slide: 1,
            dataLogList : [],
            visibleModal :false,
            loadingTable: false,
            dataAddList : [],
            photoIndex: 0,
            infoDebug : '',
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

    /**
     * Get list
     * @param {Object} params 
     */
    getListFace = async (params = {}) => {
        //remove value undefined
        params = {
            ...params,
            limit: this.state.limit,
            page: this.state.page
        }
        Object.keys(params).forEach((k) => ( params[k] == null || params[k] == '') && delete params[k]);
        let response = await getList(params);
        if (response) {
            this.setState({
                datas: response.data , 
                total : (this.state.limit * response.maxpage)
            })
        }
    }
    /**
     * event click btn search
     * @param {*} e 
     */
    submitForm = (values) => {
        this.setState({ page: 1 })
        this.getListFace(values);
    }
    /**
     * render images customer
     */
    renderImageCustumer(id) {
        this.setState({loadingTable : true , visibleModal: true})
        let bodyFormData = new FormData();
        bodyFormData.append('customer_id', id);
        // axios({
        //     method: "post",
        //     url: "https://ai.hasaki.vn/face/log",
        //     data: bodyFormData,
        //     headers: { "Content-Type": "multipart/form-data" },
        //   })
        axios.post(`https://ai.hasaki.vn/face/log?customer_id=${id}`)
            .then(response =>
                this.setState({loadingTable : false , dataLogList : response.data.log_list , dataAddList: response.data.add_list })
            )
            .catch(error => console.log(error))
    }
    renderAddList = () => {
        const {dataAddList} = this.state;
        let arrImgs = [];
        if (Array.isArray(dataAddList)) {
            dataAddList.map((d, index) => {
                arrImgs.push({
                    src: d.image,
                    origin_src : d.origin_image ? d.origin_image : '',
                    id : d.id ,
                    index : index,
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
                                    <Button className='mr-2' icon={<FontAwesomeIcon icon={faTrashAlt} />} onClick={(e) => this.onDelete(e, i.id, i.index, i.phone)} />
                                    <br />
                                    {
                                        i.landmark ?
                                            <Button className='mr-2 mt-1' icon={<FontAwesomeIcon icon={faBug}/>} 
                                            onClick={() => this.getImgDebug({ full_image_url: i.origin_src, landmark: i.landmark , crop_image_url: i.crop_image_url})} />
                                            : []
                                    }
                                </div>
                            </div>
                            <div className='mb-1 p-1' style={{ height: 68 }}>
                                {  i.id ?
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
    onDelete = (e, id , index , phone) =>{
        let {dataAddList} = this.state
        const{t} = this.props
        e.stopPropagation();
        let params = {
            id: id,
            phone : phone
        }
        let xhr = deleteCustomer(params);
        xhr.then((response) => {
            showNotify('Notification', t('hr:delete_complete'))
            dataAddList.splice(index, 1)
            this.setState({dataAddList : dataAddList})
        })
    }
    /**
     * Render content
     */
    renderContent = () => {
        const { datas } = this.state;
        let arrImgs = [];
        if (Array.isArray(datas)) {
            datas.map((d, index) => {
                arrImgs.push({
                    src: d.origin_image,
                    name: d?.fullname,
                    customer_id: d.customer_id,
                    created_at: dayjs(d.created_at).utc(0).format('HH:mm DD/MM/YY'),
                    index: index,
                    phone: d.phone,
                    id : d.id
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
                                    onClick={() => this.setState({ toggler: true, photoIndex: i.index })}
                                    style={{ width: 'auto', height: '140px' }} 
                                />
                            </div>
                            <div className='mb-1 p-1' style={{ height: 68 }}>
                                {i.name ?
                                    <div className='d-flex justify-content-between align-items-end mr-1'>
                                        <div className='mt-2' style={{ lineHeight: '1.2' }}>
                                            <small onClick={() => this.setState({infoDebug : ''},() =>this.renderImageCustumer(i.customer_id))} 
                                            style={{color:'#009aff', cursor:'pointer'}}>{i.name} </small><br />
                                            <small>{i.phone} </small>
                                        </div>
                                        <div className='text-muted float-right mt-2' style={{ lineHeight: '1.2' }}>
                                            <small>{i.customer_id}</small><br />
                                            <small style={{ fontSize: 10 }}>{i.created_at}</small>
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
     * @event change page
     * 
     * @param {*} page 
     */
    onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getListFace({ ...values }));
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

    getImgDebug(r) {
        this.setState({loadingDebug : true ,visibleDebug : true,})
        let params = {
            full_image_url: r.full_image_url,
            landmark: r.landmark,
            crop_image_url : r.crop_image_url
        }

        let xhr = getDebug(params)
        xhr.then(res => {
            if (res.status) {
                this.setState({ infoDebug : res , loadingDebug : false})
            }
        })
        .catch(err => {
            console.log(err)
        })
    }
    ondeleteLog(r , index){
        const {t} =  this.props
        let params = {
            log_id : r.id
        }
        let xhr = deleteLogCustomer(params)
        xhr.then(res => {
            showNotify('Notification', t('hr:delete_complete'))
            let newDataLogList = this.state.dataLogList.slice()
            newDataLogList.splice(index, 1)
            this.setState({ dataLogList: newDataLogList })
        })
        
    }
    render() {
        let { t } = this.props;
        let { datas ,dataLogList , dataAddList, photoIndex } = this.state
        
        const columnsLogList = [
            {
                title: 'ID',
                dataIndex: 'id'
            },
            {
                title: t('hr:customer_id'),
                dataIndex: 'customer_id'
            },
            {
                title: t('hr:distance'),
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
            {
                title: t('cropt_image'),
                render : r => <Image style={{width : 110 , height : 115 }} src={r.crop_image_url} />
            },
            {
                title: t('hr:full_image'),
                render: (text , r ,index) => r.full_image_url ?
                    <div className='d-flex justify-content-between'>
                        <Image style={{ width: 110, height: 115 }} src={r.full_image_url} />
                        <div>
                            <Button className='mr-2' icon={<FontAwesomeIcon icon={faTrashAlt} />} onClick={(e) => this.ondeleteLog(r , index)} />
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
                // render : r => timeFormatStandard(r.appeared_time, dateTimeFormat )
                render : r => dayjs(r.appeared_time).utc(0).format(dateTimeFormat)
            },
            {
                title: t('store'),
                dataIndex: 'client_name'
            },

        ]

        let arrPhotos = [];
        let arrCaption = [];
        if (Array.isArray(datas)) {
            datas.map(d => {
                arrPhotos.push(d.origin_image);
                arrCaption.push(d.fullname + ' - ' + d.phone)
            })
        }
        return (
            <div>
                <PageHeader title={t('hr:list_face')} />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabListFaceRegconite(this.props)} />
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical">
                        <Row gutter={12}>
                            <Col span={5}>
                                <Form.Item name="phone">
                                    <Input placeholder={t('phone')} />
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
                        showQuickJumper
                    />
                </div>
                {this.state.toggler && (
                    <Lightbox
                        mainSrc={arrPhotos[photoIndex]}
                        nextSrc={arrPhotos[(photoIndex + 1) % arrPhotos.length]}
                        prevSrc={arrPhotos[(photoIndex + arrPhotos.length - 1) % arrPhotos.length]}
                        onCloseRequest={() => this.setState({ toggler: false })}
                        onMovePrevRequest={() =>
                            this.setState({
                                photoIndex: photoIndex == 0 ? 0 : (photoIndex + arrPhotos.length - 1) % arrPhotos.length,
                            })
                        }
                        onMoveNextRequest={() =>
                            this.setState({
                                photoIndex: photoIndex == (arrPhotos.length - 1) ? (arrPhotos.length - 1) : (photoIndex + 1) % arrPhotos.length,
                            })
                        }
                        imageCaption={arrCaption[photoIndex]}
                    />
                )}
                <Modal
                    title={<strong>{t('hr:detail_customer')}</strong>}
                    open={this.state.visibleModal}
                    onCancel={() => this.setState({ visibleModal: false })}
                    onOk={() => { }}
                    width = {dataLogList.length < 1 && dataAddList.length  < 1 ? '20%' : 'auto'}
                    footer={false}
                    >
                        {
                            dataLogList.length < 1 && dataAddList.length < 1 ?
                            t('hr:no_data')
                            :
                            <>
                                <PageHeader title={t('hr:add_list')} />
                                    {this.renderAddList()}
                                <PageHeader title={t('hr:log_list')} />
                                <Table
                                    title={() => <strong>{t('hr:log_list')}</strong>}
                                    className={'Log-List'}
                                    dataSource={this.state.dataLogList}
                                    columns={columnsLogList}
                                    loading={this.state.loadingTable}
                                    rowKey='id'
                                    pagination={{ pageSize: 5 }}
                                />
                                
                            </>
                            
                        }
                </Modal>
                <Modal
                    title={t("hr:image_bug")}
                    open={this.state.visibleDebug}
                    onCancel={() => this.setState({visibleDebug : false})}
                    footer={false}
                >
                    <Spin spinning={this.state.loadingDebug}>
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

export default connect(mapStateToProps, mapDispatchToProps)((FaceRegconite));